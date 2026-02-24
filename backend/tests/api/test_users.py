from __future__ import annotations

from fastapi.testclient import TestClient

from src.model.user import User


class TestMe:
    def test_returns_current_user(self, auth_client: TestClient, test_user: User) -> None:
        res = auth_client.get("/me")
        assert res.status_code == 200
        data = res.json()
        assert data["uuid"] == str(test_user.uuid)
        assert data["name"] == str(test_user.name)

    def test_returns_401_without_token(self, client: TestClient) -> None:
        res = client.get("/me")
        assert res.status_code == 401
