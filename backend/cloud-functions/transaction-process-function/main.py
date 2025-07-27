import functions_framework
from flask import Request
from werkzeug.utils import secure_filename
from google.cloud import storage
import os
from google.cloud import firestore
from datetime import datetime,timezone
import vertexai
from vertexai.generative_models import GenerativeModel,Image
from io import BytesIO

# Set your Cloud Storage bucket name
BUCKET_NAME = "wallet-images1"
'''
entertainment
health
utility
groceries
dining
misc
'''
# Global GCS client to reuse across invocations
storage_client = storage.Client('graceful-byway-467117-r0')
# Initialize Firestore Client in the global scope
# This allows the client to be reused across function invocations
try:
    db = firestore.Client(project="graceful-byway-467117-r0", database="receipt-management")
except Exception as e:
    print(f"Error initializing Firestore client: {e}")
    db = None
# Initialize Vertex AI in the global scope
try:
    # Get project and location from environment variables
    PROJECT_ID = os.environ.get("GCP_PROJECT")
    LOCATION = os.environ.get("GCP_REGION")

    if not all([PROJECT_ID, LOCATION]):
        raise ValueError("GCP_PROJECT and GCP_REGION environment variables are not set.")

    vertexai.init(project=PROJECT_ID, location=LOCATION)
    # Model name for Gemini 1.0 Pro
    model = GenerativeModel("gemini-2.5-pro")
except Exception as e:
    print(f"Error initializing Vertex AI: {e}")
    model = None

@functions_framework.http
def upload_form_data(request: Request):
    """
    Accepts multipart/form-data with:
    - file: image file
    - transaction_time: string (e.g., "2025-07-26T12:34:00Z")
    - user: string (e.g., "adarsh.shaw")
    Uploads the file to GCS.
    """

    if not db:
        return {"error": "Firestore client is not available."}, 500
    
    if not model:
        return {"error": "Vertex AI model is not available."}, 500

    # Handle CORS preflight
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)

    headers = {"Access-Control-Allow-Origin": "*"}

    if request.method != "POST":
        return ({"error": "Only POST method is accepted"}, 405, headers)

    try:
        # Validate all expected fields
        if 'file' not in request.files:
            return ({"error": "Missing 'file' in form data"}, 400, headers)
        if 'transaction_time' not in request.form or 'user' not in request.form:
            return ({"error": "Missing 'transaction_time' or 'user' in form data"}, 400, headers)

        file = request.files['file']
        timestamp = request.form['transaction_time']
        transaction_time = datetime.fromtimestamp(int(timestamp) / 1000, tz=timezone.utc)
        user = request.form['user']

        if file.filename == "":
            return ({"error": "No selected file"}, 400, headers)

        filename = secure_filename(file.filename)
        file_bytes = file.read()

        print(f"Received file: {filename}")
        print(f"Size: {len(file_bytes)} bytes")
        print(f"transaction_time: {transaction_time}")
        print(f"User: {user}")

        # Upload to GCS
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(filename)
        blob.upload_from_string(file_bytes, content_type=file.content_type)
        gcs_uri= f"gs://{BUCKET_NAME}/{filename}",

        print(f"File uploaded to GCS: gs://{BUCKET_NAME}/{filename}")
        try:
            # Construct the prompt for Gemini
            context='''you are a finance tracker fetch the data from upload receipt and respond in json format
                    {
                    "details":{
                        "transaction_type":entertainment | health | utility | groceries | dining | misc
                        "trasaction_amount":<total_amount>,
                        "transaction_details:<breakdown of transaction>
                        "transaction_location:<store address if available else na"
                    }
                    }
                    '''
            user_query="Extract text from this image and classify the details for the transaction:"
            prompt = f"""
            Here is the user's data for context for the transaction:
            ---
            {context}
            ---

            Based on the data above, please answer the following user query:
            "{user_query}"
            """

            image_bytes = blob.download_as_bytes()
            img = Image.from_bytes(image_bytes)


            # Generate content
            response = model.generate_content([prompt, img])

        except Exception as e:
            print(f"An error occurred while calling Gemini API: {e}")
            return ({"error": "An internal error occurred while processing the request."}, 500, headers)
        collection_name='sample_transactions'
        doc_ref = db.collection(collection_name).document()

        doc_data = {
            "user": user,
            "transaction_time": transaction_time,
            "gcs_uri": gcs_uri,
            "details":response.text
        }
        doc_ref.set(doc_data)
        print(f"Saved to Firestore: {doc_ref.id}")

        template_wallet = {
            "id": "3388000000022969024.simple_class",
            "classTemplateInfo": {
                "cardTemplateOverride": {
                    "cardRowTemplateInfos": [
                        {
                            "twoItems": {
                                "startItem": {
                                    "firstValue": {
                                        "fields": [
                                            {"fieldPath": "object.textModulesData[\"details\"]"}
                                        ]
                                    }
                                },
                                "endItem": {
                                    "firstValue": {
                                        "fields": [
                                            {"fieldPath": "object.textModulesData[\"subtitle\"]"}
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                },
                "detailsTemplateOverride": {
                    "detailsItemInfos": [
                        {
                            "item": {
                                "firstValue": {
                                    "fields": [
                                        {"fieldPath": "object.textModulesData[\"details\"]"}
                                    ]
                                }
                            }
                        },
                        {
                            "item": {
                                "firstValue": {
                                    "fields": [
                                        {"fieldPath": "object.textModulesData[\"subtitle\"]"}
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            "textModulesData": [
                {"id": "details", "header": "Details", "body": ""},
                {"id": "subtitle", "header": "Subtitle", "body": ""}
            ]
        }


        return ({
            "message": f"File '{filename}' uploaded successfully.",
            "gcs_uri": gcs_uri,
            "user": user,
            "transaction_time": transaction_time,
            "document_id": doc_ref.id,
            "details":response.text
        }, 200, headers)

    except Exception as e:
        print(f"Error: {e}")
        return ({"error": "Failed to process form data or upload to GCS."}, 500, headers)


def testwallet():
    import json
    import requests
    from google.cloud import storage
    from google.auth.transport.requests import Request
    from google.oauth2 import service_account

    # === Config ===
    SERVICE_ACCOUNT_FILE = "gs://wallet-images1/graceful-byway-467117-r0-16d8e26c38c1.json"

    WALLET_API_URL = "https://walletobjects.googleapis.com/walletobjects/v1/genericClass"
    SCOPES = ["https://www.googleapis.com/auth/wallet_object.issuer"]


    # === Load JSON from GCS ===
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(SA_BLOB_PATH)

    with tempfile.NamedTemporaryFile(mode="w+b", delete=False, suffix=".json") as temp_file:
            blob.download_to_file(temp_file)
            SERVICE_ACCOUNT_FILE = temp_file.name
    # === Authenticate ===
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    credentials.refresh(Request())


    template_wallet = {
        "id": "3388000000022969024.simple_class",
        "classTemplateInfo": {
            "cardTemplateOverride": {
                "cardRowTemplateInfos": [
                    {
                        "twoItems": {
                            "startItem": {
                                "firstValue": {
                                    "fields": [
                                        {"fieldPath": "object.textModulesData[\"details\"]"}
                                    ]
                                }
                            },
                            "endItem": {
                                "firstValue": {
                                    "fields": [
                                        {"fieldPath": "object.textModulesData[\"subtitle\"]"}
                                    ]
                                }
                            }
                        }
                    }
                ]
            },
            "detailsTemplateOverride": {
                "detailsItemInfos": [
                    {
                        "item": {
                            "firstValue": {
                                "fields": [
                                    {"fieldPath": "object.textModulesData[\"details\"]"}
                                ]
                            }
                        }
                    },
                    {
                        "item": {
                            "firstValue": {
                                "fields": [
                                    {"fieldPath": "object.textModulesData[\"subtitle\"]"}
                                ]
                            }
                        }
                    }
                ]
            }
        },
        "textModulesData": [
            {"id": "details", "header": "Details", "body": ""},
            {"id": "subtitle", "header": "Subtitle", "body": ""}
        ]
    }

    # === Post to Google Wallet API ===
    headers = {
        "Authorization": f"Bearer {credentials.token}",
        "Content-Type": "application/json",
    }

    response = requests.post(WALLET_API_URL, headers=headers, json=template_wallet)

    # === Output ===
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())

if __name__=='__main__':
    testwallet()
