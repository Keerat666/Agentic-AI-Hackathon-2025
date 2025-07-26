from firebase_functions import firestore_fn
from firebase_admin import initialize_app, firestore


@firestore_fn.on_document_created(
    document="transactions/{transactionId}", # Example collection
    database="receipt-management" # Specify your named database ID here
)
def add_status_to_transaction(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]):
    transaction_id = event.params["transactionId"]
    document_ref = event.data.reference

    print(f"New transaction created in 'receipt-management': {transaction_id}")

    data_to_add = {
        "status": "pending",
        "processedBy": "cloudFunction"
    }

    try:
        document_ref.set(data_to_add, merge=True)
        print(f"Successfully added status to transaction {transaction_id}")
    except Exception as e:
        print(f"Error adding status to transaction {transaction_id}: {e}")
        raise
    return None