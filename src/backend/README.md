# Backend (FastAPI)

Simple backend API that proxies weather requests to Meteosource.

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:

   pip install -r requirements.txt

3. Set API key:

   export METEOSOURCE_API_KEY="your_api_key"

4. Run server:

   uvicorn main:app --reload --host 0.0.0.0 --port 8000

## Endpoints

- GET /health
- GET /api/weather?city=Berlin
