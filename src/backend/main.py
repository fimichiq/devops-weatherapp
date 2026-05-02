import os

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

METEOSOURCE_API_URL = "https://www.meteosource.com/api/v1/free/point"
METEOSOURCE_API_KEY = os.getenv("METEOSOURCE_API_KEY")

app = FastAPI(title="Weather Backend", version="0.1.0")

# Allow local frontend dev server to call backend during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/weather")
async def get_weather(city: str = Query(..., min_length=1)) -> dict[str, str | float]:
    if not METEOSOURCE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Server is missing METEOSOURCE_API_KEY environment variable.",
        )

    params = {
        "place_id": city,
        "sections": "current",
        "language": "en",
        "units": "metric",
        "key": METEOSOURCE_API_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(METEOSOURCE_API_URL, params=params)
            response.raise_for_status()
            payload = response.json()

        current = payload.get("current", {})
        temperature = current.get("temperature")
        summary = current.get("summary")

        if temperature is None or summary is None:
            raise HTTPException(
                status_code=502,
                detail="Unexpected response format from weather provider.",
            )

        return {
            "city": city,
            "temperature": float(temperature),
            "summary": str(summary),
        }
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Weather provider returned status {exc.response.status_code}.",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not reach weather provider.",
        ) from exc
