# Backend Setup

This document provides instructions for setting up the backend services for the application.

## Cloud Functions

The cloud functions are located in the `cloud-functions` directory. To set up the environment and run the functions, follow these steps:

### 1. Create and Activate a Virtual Environment

It is recommended to use a virtual environment to manage the dependencies for the cloud functions.

```bash
python3 -m venv backend/cloud-functions/venv
source backend/cloud-functions/venv/bin/activate
```

### 2. Install Dependencies

Install the required Python packages using pip and the provided `requirements.txt` file.

```bash
pip install -r backend/cloud-functions/requirements.txt
```

### 3. Set quota project in local

Set quota project for gcloud billing.
```bash
gcloud auth application-default set-quota-project graceful-byway-467117-r0
```

### 3. Locally - Running the Functions

To run a specific function, use the `functions-framework` command. For example, to run the `get-user-data-function`:

```bash
functions-framework --target=get_user_data --source=backend/cloud-functions/get-user-data-function/main.py --port=8080
```


### 4. Deploying - cloud Functions

To deploy a specific function, use the `gcloud` command. For example, to deploy the `get-user-data-function`:

```bash
gcloud functions deploy get-user-data \
--project=[YOUR_PROJECT_ID] \
--region=us-central1 \
--runtime=python311 \
--source=./get-user-data-function/ \
--entry-point=get_user_data \
--trigger-http \
--allow-unauthenticated \
--service-account=[YOUR_SERVICE_ACCOUNT_EMAIL]
```


### 5. Run - deployed cloud Functions

To run a deployed cloud function, use the `gcloud` command. For example, to run the deployed `get-user-data-function`:

```bash
gcloud functions deploy get-user-data \
--project=[YOUR_PROJECT_ID] \
--region=us-central1 \
--runtime=python311 \
--source=./get-user-data-function/ \
--entry-point=get_user_data \
--trigger-http \
--allow-unauthenticated \
--service-account=[YOUR_SERVICE_ACCOUNT_EMAIL]
```

Replace `get_user_data` with the name of the function you want to run.