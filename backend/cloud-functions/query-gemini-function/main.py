import os
import functions_framework
import vertexai
from vertexai.generative_models import GenerativeModel

# Initialize Vertex AI in the global scope
try:
    # Get project and location from environment variables
    PROJECT_ID = os.environ.get("GCP_PROJECT")
    LOCATION = os.environ.get("GCP_REGION")

    if not all([PROJECT_ID, LOCATION]):
        raise ValueError("GCP_PROJECT and GCP_REGION environment variables are not set.")

    vertexai.init(project=PROJECT_ID, location=LOCATION)
    # Model name for Gemini 1.0 Pro
    model = GenerativeModel("gemini-1.0-pro-001")
except Exception as e:
    print(f"Error initializing Vertex AI: {e}")
    model = None

@functions_framework.http
def query_gemini(request):
    """
    HTTP Cloud Function to interact with the Gemini API.
    Args:
        request (flask.Request): The request object.
        Expected JSON payload:
        {
            "user_data": {},
            "user_query": "Your question here",
            "context": "Initial prompt or context"
        }
    Returns:
        A JSON response with Gemini's reply or an error message.
    """
    if not model:
        return {"error": "Vertex AI model is not available."}, 500

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

    user_data = request_json.get("user_data")
    user_query = request_json.get("user_query")
    context = request_json.get("context", "You are a helpful assistant.") # Default context

    if not user_query:
        return ({"error": "Missing 'user_query' in request body"}, 400, headers)

    try:
        # Construct the prompt for Gemini
        prompt = f"""
        {context}

        Here is the user's data for context:
        ---
        {user_data}
        ---

        Based on the data above, please answer the following user query:
        "{user_query}"
        """

        # Generate content
        response = model.generate_content(prompt)

        # Return the generated text
        return ({"reply": response.text}, 200, headers)

    except Exception as e:
        print(f"An error occurred while calling Gemini API: {e}")
        return ({"error": "An internal error occurred while processing the request."}, 500, headers)
