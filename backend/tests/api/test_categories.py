from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.user import User


class TestGetCategories:
    def test_returns_empty_list(self, auth_client: TestClient) -> None:
        res = auth_client.get("/categories")
        assert res.status_code == 200
        assert res.json() == []

    def test_returns_categories(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        cat = Category(user_uuid=str(test_user.uuid), name="食費")
        db.add(cat)
        db.commit()
        db.refresh(cat)

        res = auth_client.get("/categories")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1
        assert data[0]["name"] == "食費"
        assert data[0]["uuid"] == cat.uuid


class TestPostCategory:
    def test_creates_category(self, auth_client: TestClient) -> None:
        res = auth_client.post("/categories", json={"name": "交通費"})
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "交通費"
        assert "uuid" in data

    def test_rejects_empty_body(self, auth_client: TestClient) -> None:
        res = auth_client.post("/categories", json={})
        assert res.status_code == 422


class TestPatchCategory:
    def test_updates_name(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        cat = Category(user_uuid=str(test_user.uuid), name="食費")
        db.add(cat)
        db.commit()
        db.refresh(cat)

        res = auth_client.patch(f"/categories/{cat.uuid}", json={"name": "外食費"})
        assert res.status_code == 200
        assert res.json()["name"] == "外食費"
        assert res.json()["uuid"] == cat.uuid

    def test_returns_404_for_nonexistent(self, auth_client: TestClient) -> None:
        res = auth_client.patch("/categories/nonexistent", json={"name": "test"})
        assert res.status_code == 404

    def test_keeps_name_with_empty_body(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        cat = Category(user_uuid=str(test_user.uuid), name="食費")
        db.add(cat)
        db.commit()
        db.refresh(cat)

        res = auth_client.patch(f"/categories/{cat.uuid}", json={})
        assert res.status_code == 200
        assert res.json()["name"] == "食費"


class TestDeleteCategory:
    def test_deletes_category(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        cat = Category(user_uuid=str(test_user.uuid), name="食費")
        db.add(cat)
        db.commit()
        db.refresh(cat)

        res = auth_client.delete(f"/categories/{cat.uuid}")
        assert res.status_code == 204

        res = auth_client.get("/categories")
        assert res.json() == []

    def test_returns_404_for_nonexistent(self, auth_client: TestClient) -> None:
        res = auth_client.delete("/categories/nonexistent")
        assert res.status_code == 404
