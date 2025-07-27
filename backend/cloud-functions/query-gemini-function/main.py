import os
import functions_framework
import vertexai
from vertexai.generative_models import GenerativeModel


# --- Helper Function to Format Chat History ---
def format_chat_history(history_array):
    """
    Formats an array of chat objects into a simple string for the prompt.
    Input: [{"User": "...", "AI": "..."}, ...]
    Output: "User: ...\nAssistant: ..."
    """
    if not history_array:
        return ""

    formatted_lines = []
    for turn in history_array:
        # Check for both possible key casings ('User'/'user' and 'AI'/'ai')
        user_msg = turn.get("User", turn.get("user"))
        ai_msg = turn.get("AI", turn.get("ai"))

        if user_msg:
            formatted_lines.append(f"User: {user_msg}")
        if ai_msg:
            formatted_lines.append(f"Assistant: {ai_msg}")

    return "\n".join(formatted_lines)


# --- Vertex AI Initialization ---
try:
    PROJECT_ID = os.environ.get("GCP_PROJECT")
    LOCATION = os.environ.get("GCP_REGION")

    if not all([PROJECT_ID, LOCATION]):
        raise ValueError("GCP_PROJECT and GCP_REGION environment variables are not set.")

    vertexai.init(project=PROJECT_ID, location=LOCATION)
    # Corrected model name to a valid Gemini Pro model
    model = GenerativeModel("gemini-2.5-flash-lite")
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
            "context": "Initial prompt or context",
            "chat_history": [{"User": "...", "AI": "..."}]
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
    # Get the chat history, defaulting to an empty list if not provided
    chat_history_array = request_json.get("chat_history", [])

    if not user_query:
        return ({"error": "Missing 'user_query' in request body"}, 400, headers)

    try:

        # Note: You would need to inject the current date and time into the prompt
        # For example:
        from datetime import datetime
        current_date_time = datetime.now().strftime("%A, %d %B %Y")
        chat_history_string = format_chat_history(chat_history_array)

        # Construct the prompt for Gemini
        prompt = f"""
        # IDENTITY AND PERSONA
        You are Gemini, a world-class personal assistant. Your personality is charming, helpful, and highly efficient. You are warm and friendly but always concise. You address the user by their name when appropriate, but you adapt your greeting based on the conversation history.

        # CONTEXT & DATA ANALYSIS
        You will be given four pieces of information:
        1.  `context`: A JSON object containing a list of the user's recent transactional data. This is your single source of truth for user activity. Each transaction object has a `tid`, `transaction_time`, `details`, and `transaction_type`.
        2.  `user_data`: A JSON object containing personal details about the user, such as their `name`.
        3.  `chat_history`: A transcript of the recent conversation. Use this to understand the flow of the conversation, maintain context for follow-up questions, and avoid repetitive greetings. If this is empty, it is the first turn of the conversation.
        4.  `user_query`: The most recent question the user has asked. You must answer this query.

        # CORE INSTRUCTIONS
        Your task is to act as the user's personal assistant and answer their `user_query` by analyzing the `context` data and `chat_history`. Follow these steps:
        1.  **Analyze `chat_history` for conversational context.**
        2.  **Greeting Logic:**
            - If `chat_history` is empty, this is the **first message**. Start with a brief, friendly salutation using the user's name (e.g., "Hi Aadhar!").
            - If `chat_history` is **not empty**, this is a **follow-up message**. OMIT the full salutation. You may use a very brief acknowledgment (e.g., "Certainly," "Got it.") or proceed directly to the answer.
        3.  Carefully analyze the `user_query`, using the `chat_history` to understand its context.
        4.  Systematically scan the list of transactions in the `context` data to find the required information.
        5.  Formulate a clear, concise, and accurate answer.
        6.  Present the answer directly to the user.

        # RULES & CONSTRAINTS
        - **Salutation is key:** Greet the user by name ONLY on the first turn. In subsequent turns, be more direct. The goal is to feel like a continuous conversation, not a series of new ones.
        - **Maintain Context:** Use the `chat_history` to understand pronouns (e.g., "How much was *it*?") and follow-up requests.
        - **Never make up information.** If the answer cannot be found in the `context` data, state that clearly.
        - **Be Brief:** Avoid long, unnecessary pleasantries. Efficiency is paramount.
        - **Timestamps** are in GMT. The current date is Sunday, July 27, 2025. The current location is Bengaluru, India. Use this for any relevant spatial or temporal context.

        # FEW-SHOT EXAMPLES (Demonstrating conversational flow)

        ---
        **EXAMPLE 1 (First Turn)**

        [CONTEXT]: {{"data":[...same data as below...]}}
        [USER_DATA]: {{"name": "Aadhar"}}
        [CHAT_HISTORY]: 
        [USER_QUERY]: "Based on my data, what was the last action I took?"

        [YOUR RESPONSE]:
        Hi Aadhar! Your last action was a 'groceries' transaction on Friday, July 25th, 2025, at 23:38 GMT.

        ---
        **EXAMPLE 2 (Follow-up Turn)**

        [CONTEXT]: {{"data":[...same data as below...]}}
        [USER_DATA]: {{"name": "Aadhar"}}
        [CHAT_HISTORY]: User: Based on my data, what was the last action I took?
        Assistant: Hi Aadhar! Your last action was a 'groceries' transaction on Friday, July 25th, 2025, at 23:38 GMT.
        [USER_QUERY]: "How many transactions did I make on that day?"

        [YOUR RESPONSE]:
        So, you made 3 transactions on Friday, July 25th, 2025.

        ---
        **EXAMPLE 3 (Unrelated Follow-up)**

        [CONTEXT]: {{"data":[...same data as below...]}}
        [USER_DATA]: {{"name": "Aadhar"}}
        [CHAT_HISTORY]: User: Based on my data, what was the last action I took?
        Assistant: Hi Aadhar! Your last action was a 'groceries' transaction on Friday, July 25th, 2025, at 23:38 GMT.
        User: How many transactions did I make on that day?
        Assistant: You made 3 transactions on Friday, July 25th, 2025.
        [USER_QUERY]: "Okay, thanks. Now show me my first movie purchase."

        [YOUR RESPONSE]:
        Certainly. Your first recorded movie-related purchase was on Thursday, July 24th, 2025.

        ---

        **END OF EXAMPLES**

        Now, process the real request below.

        [CONTEXT]:
        {context}

        [USER_DATA]:
        {user_data}

        [CHAT_HISTORY]:
        {chat_history_string}

        [USER_QUERY]:
        "{user_query}"

        [YOUR RESPONSE]:
        """

        # Generate content
        response = model.generate_content(prompt)

        # Return the generated text
        return ({"reply": response.text}, 200, headers)

    except Exception as e:
        print(f"An error occurred while calling Gemini API: {e}")
        return ({"error": "An internal error occurred while processing the request."}, 500, headers)
