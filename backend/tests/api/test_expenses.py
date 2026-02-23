from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.expense import Expense
from src.model.user import User


def _create_category(db: Session, user_uuid: str, name: str = "食費") -> Category:
    cat = Category(user_uuid=user_uuid, name=name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def _create_expense(db: Session, user_uuid: str, name: str = "ランチ", amount: int = 1000) -> Expense:
    expense = Expense(user_uuid=user_uuid, name=name, amount=amount)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


class TestListExpenses:
    def test_returns_empty_list(self, auth_client: TestClient) -> None:
        res = auth_client.get("/expenses")
        assert res.status_code == 200
        assert res.json() == []

    def test_returns_expenses(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        _create_expense(db, str(test_user.uuid))

        res = auth_client.get("/expenses")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1
        assert data[0]["name"] == "ランチ"
        assert data[0]["amount"] == 1000


class TestPostExpense:
    def test_creates_expense(self, auth_client: TestClient) -> None:
        res = auth_client.post("/expenses", json={"name": "ランチ", "amount": 800})
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "ランチ"
        assert data["amount"] == 800
        assert "uuid" in data

    def test_creates_expense_with_categories(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        cat = _create_category(db, str(test_user.uuid))

        res = auth_client.post("/expenses", json={"name": "ランチ", "amount": 800, "category_uuids": [cat.uuid]})
        assert res.status_code == 201
        assert len(res.json()["categories"]) == 1
        assert res.json()["categories"][0]["uuid"] == cat.uuid

    def test_rejects_zero_amount(self, auth_client: TestClient) -> None:
        res = auth_client.post("/expenses", json={"name": "ランチ", "amount": 0})
        assert res.status_code == 422

    def test_rejects_empty_body(self, auth_client: TestClient) -> None:
        res = auth_client.post("/expenses", json={})
        assert res.status_code == 422


class TestPatchExpense:
    def test_updates_name(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        expense = _create_expense(db, str(test_user.uuid))

        res = auth_client.patch(f"/expenses/{expense.uuid}", json={"name": "ディナー"})
        assert res.status_code == 200
        assert res.json()["name"] == "ディナー"
        assert res.json()["amount"] == 1000

    def test_updates_amount(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        expense = _create_expense(db, str(test_user.uuid))

        res = auth_client.patch(f"/expenses/{expense.uuid}", json={"amount": 2000})
        assert res.status_code == 200
        assert res.json()["amount"] == 2000

    def test_updates_categories(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        expense = _create_expense(db, str(test_user.uuid))
        cat = _create_category(db, str(test_user.uuid))

        res = auth_client.patch(f"/expenses/{expense.uuid}", json={"category_uuids": [cat.uuid]})
        assert res.status_code == 200
        assert len(res.json()["categories"]) == 1

    def test_returns_404_for_nonexistent(self, auth_client: TestClient) -> None:
        res = auth_client.patch("/expenses/nonexistent", json={"name": "test"})
        assert res.status_code == 404

    def test_keeps_values_with_empty_body(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        expense = _create_expense(db, str(test_user.uuid))

        res = auth_client.patch(f"/expenses/{expense.uuid}", json={})
        assert res.status_code == 200
        assert res.json()["name"] == "ランチ"


class TestDeleteExpense:
    def test_soft_deletes_expense(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        expense = _create_expense(db, str(test_user.uuid))

        res = auth_client.delete(f"/expenses/{expense.uuid}")
        assert res.status_code == 204

        res = auth_client.get("/expenses")
        assert res.json() == []

    def test_returns_404_for_nonexistent(self, auth_client: TestClient) -> None:
        res = auth_client.delete("/expenses/nonexistent")
        assert res.status_code == 404
