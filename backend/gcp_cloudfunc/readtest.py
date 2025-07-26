import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account.
cred = credentials.Certificate("D:\\dev\\hackathon25\\Agentic-AI-Hackathon-2025\\backend\\gcp_cloudfunc\\graceful-byway-467117-r0-e713f790f182.json")

app = firebase_admin.initialize_app(cred)

db = firestore.client(database_id='receipt-management')
# doc_ref = db.collection("Transaction").document("aturing")
# doc_ref.set({"first": "Alan", "middle": "Mathison", "last": "Turing", "born": 1912})


users_ref = db.collection("Transaction")
docs = users_ref.stream()

for doc in docs:
    print(f"{doc.id} => {doc.to_dict()}")