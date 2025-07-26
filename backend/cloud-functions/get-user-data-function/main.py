import os
import functions_framework
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud.firestore_v1 import Query
from datetime import datetime, timedelta, timezone

# Initialize Firestore Client in the global scope
# This allows the client to be reused across function invocations
try:
    db = firestore.Client(project="graceful-byway-467117-r0", database="receipt-management")
except Exception as e:
    print(f"Error initializing Firestore client: {e}")
    db = None


@functions_framework.http
def get_user_data(request):
    """
    HTTP Cloud Function to fetch user data from Firestore based on a time range.
    Args:
        request (flask.Request): The request object.
        Expected JSON payload:
        {
            "collection": "Transaction",
            "query_type": "last_10_transactions | last_7_days" | "last_30_days" | "custom_time_range",
            "start_date": "YYYY-MM-DD" (required for "custom"),
            "end_date": "YYYY-MM-DD" (required for "custom")
        }
    Returns:
        A JSON response with the user data or an error message.
    """
    if not db:
        return {"error": "Firestore client is not available."}, 500

    # Set CORS headers for preflight requests
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)

    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}

    if request.method != 'POST':
        return ({"error": "Only POST method is accepted"}, 405, headers)

    request_json = request.get_json(silent=True)

    if not request_json:
        return ({"error": "Invalid JSON"}, 400, headers)

    collection_name = request_json.get("collection")
    query_type = request_json.get("query_type")

    if not all([collection_name, query_type]):
        return ({"error": "Missing 'collection' or 'query_type' in request body"}, 400, headers)

    try:
        # <<<<----------------------------------------------------------------------------------->>>>
        # **feat: Check if the collection exists or is empty**
        # We try to get just one document. If we get nothing, the collection either doesn't exist or is empty, so we can stop here.
        collection_ref = db.collection(collection_name)
        docs_check = collection_ref.limit(1).get()
        if not docs_check:
            return ({"error": f"Collection '{collection_name}' does not exist or is empty."}, 404, headers)


        # <<<<----------------------------------------------------------------------------------->>>>
        # **feat: Handle last_10_transactions separately**
        if query_type == "last_10_transactions":
            docs = (
                collection_ref
                .order_by("transaction_time", direction=Query.DESCENDING)
                .limit(10)
                .stream()
            )
            results = [doc.to_dict() for doc in docs]
            return ({"data": results}, 200, headers)


        now = datetime.now(timezone.utc)
        start_date_dt = None
        end_date_dt = now


        # <<<<----------------------------------------------------------------------------------->>>>
        # **feat: Handle time based filter queries**
        if query_type == "last_7_days":
            start_date_dt = now - timedelta(days=7)
        elif query_type == "last_30_days":
            start_date_dt = now - timedelta(days=30)
        elif query_type == "custom_time_range":
            start_date_str = request_json.get("start_date")
            end_date_str = request_json.get("end_date")
            if not start_date_str or not end_date_str:
                return ({"error": "For 'custom' time_range, 'start_date' and 'end_date' are required."}, 400, headers)

            # Add timezone information to make them offset-aware
            start_date_dt = datetime.strptime(start_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            # Add one day to the end date to include the entire day
            end_date_dt = (datetime.strptime(end_date_str, "%Y-%m-%d") + timedelta(days=1)).replace(tzinfo=timezone.utc)
        else:
            return ({"error": "Invalid time_range. Use 'last_7_days', 'last_30_days', or 'custom_time_range'."}, 400, headers)

        # Query the database
        # Assumes documents have a 'created_at' timestamp field
        docs = (
            db.collection(collection_name)
            .where(filter=FieldFilter("transaction_time", ">=", start_date_dt))
            .where(filter=FieldFilter("transaction_time", "<", end_date_dt))  # Use '<' for end_date for consistency
            .stream()
        )

        results = [doc.to_dict() for doc in docs]

        return ({"data": results}, 200, headers)

    except Exception as e:
        print(f"An error occurred: {e}")
        return ({"error": "An internal error occurred while fetching data."}, 500, headers)

