import functions_framework
from flask import Request
from werkzeug.utils import secure_filename
from google.cloud import storage
import os

# Set your Cloud Storage bucket name
BUCKET_NAME = "wallet-images1"

# Global GCS client to reuse across invocations
storage_client = storage.Client('graceful-byway-467117-r0')

@functions_framework.http
def upload_form_data(request: Request):
    """
    Accepts multipart/form-data with:
    - file: image file
    - timestamp: string (e.g., "2025-07-26T12:34:00Z")
    - user: string (e.g., "adarsh.shaw")
    Uploads the file to GCS.
    """

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
        if 'timestamp' not in request.form or 'user' not in request.form:
            return ({"error": "Missing 'timestamp' or 'user' in form data"}, 400, headers)

        file = request.files['file']
        timestamp = request.form['timestamp']
        user = request.form['user']

        if file.filename == "":
            return ({"error": "No selected file"}, 400, headers)

        filename = secure_filename(file.filename)
        file_bytes = file.read()

        print(f"Received file: {filename}")
        print(f"Size: {len(file_bytes)} bytes")
        print(f"Timestamp: {timestamp}")
        print(f"User: {user}")

        # Upload to GCS
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(filename)
        blob.upload_from_string(file_bytes, content_type=file.content_type)

        print(f"File uploaded to GCS: gs://{BUCKET_NAME}/{filename}")

        return ({
            "message": f"File '{filename}' uploaded successfully.",
            "gcs_uri": f"gs://{BUCKET_NAME}/{filename}",
            "user": user,
            "timestamp": timestamp
        }, 200, headers)

    except Exception as e:
        print(f"Error: {e}")
        return ({"error": "Failed to process form data or upload to GCS."}, 500, headers)
