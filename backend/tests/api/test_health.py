from __future__ import annotations

from fastapi.testclient import TestClient


def test_root(client: TestClient) -> None:
    res = client.get("/")
    assert res.status_code == 200
    assert res.json() == {"message": "BurnStyle API is running"}


def test_health_check(auth_client: TestClient) -> None:
    res = auth_client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}
