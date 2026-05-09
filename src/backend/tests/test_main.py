import sys
from pathlib import Path

import httpx
from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))

import main


class FakeResponse:
    def __init__(self, status_code: int = 200, payload: dict | None = None):
        self.status_code = status_code
        self._payload = payload or {}
        self.request = httpx.Request("GET", main.METEOSOURCE_API_URL)

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise httpx.HTTPStatusError(
                message="upstream error",
                request=self.request,
                response=httpx.Response(self.status_code, request=self.request),
            )

    def json(self) -> dict:
        return self._payload


class FakeAsyncClient:
    def __init__(
        self, response: FakeResponse | None = None, request_error: Exception | None = None
    ):
        self._response = response
        self._request_error = request_error

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url: str, params: dict):
        if self._request_error:
            raise self._request_error
        return self._response


def test_health_returns_ok() -> None:
    client = TestClient(main.app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_weather_requires_api_key(monkeypatch) -> None:
    monkeypatch.setattr(main, "METEOSOURCE_API_KEY", None)
    client = TestClient(main.app)

    response = client.get("/api/weather", params={"city": "berlin"})

    assert response.status_code == 500
    assert "METEOSOURCE_API_KEY" in response.json()["detail"]


def test_weather_returns_mapped_payload(monkeypatch) -> None:
    monkeypatch.setattr(main, "METEOSOURCE_API_KEY", "test-key")

    fake_response = FakeResponse(
        payload={"current": {"temperature": 21.2, "summary": "Clear"}}
    )

    monkeypatch.setattr(
        main.httpx,
        "AsyncClient",
        lambda timeout: FakeAsyncClient(response=fake_response),
    )

    client = TestClient(main.app)
    response = client.get("/api/weather", params={"city": "berlin"})

    assert response.status_code == 200
    assert response.json() == {
        "city": "berlin",
        "temperature": 21.2,
        "summary": "Clear",
    }


def test_weather_handles_provider_status_error(monkeypatch) -> None:
    monkeypatch.setattr(main, "METEOSOURCE_API_KEY", "test-key")

    monkeypatch.setattr(
        main.httpx,
        "AsyncClient",
        lambda timeout: FakeAsyncClient(response=FakeResponse(status_code=503)),
    )

    client = TestClient(main.app)
    response = client.get("/api/weather", params={"city": "berlin"})

    assert response.status_code == 502
    assert response.json()["detail"] == "Weather provider returned status 503."


def test_weather_handles_provider_request_error(monkeypatch) -> None:
    monkeypatch.setattr(main, "METEOSOURCE_API_KEY", "test-key")

    request_error = httpx.RequestError("network down")
    monkeypatch.setattr(
        main.httpx,
        "AsyncClient",
        lambda timeout: FakeAsyncClient(request_error=request_error),
    )

    client = TestClient(main.app)
    response = client.get("/api/weather", params={"city": "berlin"})

    assert response.status_code == 502
    assert response.json()["detail"] == "Could not reach weather provider."
