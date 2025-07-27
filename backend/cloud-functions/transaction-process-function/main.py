import functions_framework
from flask import Request
from werkzeug.utils import secure_filename
from google.cloud import storage
import os
from google.cloud import firestore
from datetime import datetime,timezone

# Set your Cloud Storage bucket name
BUCKET_NAME = "wallet-images1"

# Global GCS client to reuse across invocations
storage_client = storage.Client('graceful-byway-467117-r0')
# Initialize Firestore Client in the global scope
# This allows the client to be reused across function invocations
try:
    db = firestore.Client(project="graceful-byway-467117-r0", database="receipt-management")
except Exception as e:
    print(f"Error initializing Firestore client: {e}")
    db = None

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
        collection_name='sample_transactions'
        doc_ref = db.collection(collection_name).document()

        doc_data = {
            "user": user,
            "transaction_time": transaction_time,
            "gcs_uri": gcs_uri
        }
        doc_ref.set(doc_data)
        print(f"Saved to Firestore: {doc_ref.id}")

        return ({
            "message": f"File '{filename}' uploaded successfully.",
            "gcs_uri": gcs_uri,
            "user": user,
            "transaction_time": transaction_time,
            "document_id": doc_ref.id,
        }, 200, headers)

    except Exception as e:
        print(f"Error: {e}")
        return ({"error": "Failed to process form data or upload to GCS."}, 500, headers)
