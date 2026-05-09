from __future__ import annotations

from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.expense import Expense
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.model.expense_template import ExpenseTemplate
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


class TestMergeCategory:
    def _create_pair(self, db: Session, user: User) -> tuple[Category, Category]:
        source = Category(user_uuid=str(user.uuid), name="外食")
        target = Category(user_uuid=str(user.uuid), name="食費")
        db.add_all([source, target])
        db.commit()
        db.refresh(source)
        db.refresh(target)
        return source, target

    def _create_expense(self, db: Session, user: User, name: str = "ランチ") -> Expense:
        expense = Expense(
            user_uuid=str(user.uuid),
            name=name,
            amount=1000,
            expensed_at=datetime.now(UTC),
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense

    def test_returns_target_and_deletes_source(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        source, target = self._create_pair(db, test_user)

        res = auth_client.post(f"/categories/{source.uuid}/merge", json={"target_uuid": target.uuid})
        assert res.status_code == 200
        assert res.json() == {"uuid": target.uuid, "name": target.name}

        remaining = auth_client.get("/categories").json()
        assert {c["uuid"] for c in remaining} == {target.uuid}

    def test_relinks_expense_associations(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        source, target = self._create_pair(db, test_user)
        expense = self._create_expense(db, test_user)
        db.add(ExpenseCategoryAssociation(expense_uuid=expense.uuid, category_uuid=source.uuid))
        db.commit()

        res = auth_client.post(f"/categories/{source.uuid}/merge", json={"target_uuid": target.uuid})
        assert res.status_code == 200

        assocs = db.query(ExpenseCategoryAssociation).all()
        assert len(assocs) == 1
        assert assocs[0].expense_uuid == expense.uuid
        assert assocs[0].category_uuid == target.uuid

    def test_deduplicates_when_expense_already_on_target(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        source, target = self._create_pair(db, test_user)
        expense = self._create_expense(db, test_user)
        db.add_all([
            ExpenseCategoryAssociation(expense_uuid=expense.uuid, category_uuid=source.uuid),
            ExpenseCategoryAssociation(expense_uuid=expense.uuid, category_uuid=target.uuid),
        ])
        db.commit()

        res = auth_client.post(f"/categories/{source.uuid}/merge", json={"target_uuid": target.uuid})
        assert res.status_code == 200

        assocs = db.query(ExpenseCategoryAssociation).all()
        assert len(assocs) == 1
        assert assocs[0].category_uuid == target.uuid

    def test_relinks_expense_templates(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        source, target = self._create_pair(db, test_user)
        template = ExpenseTemplate(
            user_uuid=str(test_user.uuid),
            name="定期",
            amount=500,
            category_uuid=source.uuid,
        )
        db.add(template)
        db.commit()
        db.refresh(template)

        res = auth_client.post(f"/categories/{source.uuid}/merge", json={"target_uuid": target.uuid})
        assert res.status_code == 200

        db.refresh(template)
        assert template.category_uuid == target.uuid

    def test_rejects_same_source_and_target(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        cat = Category(user_uuid=str(test_user.uuid), name="食費")
        db.add(cat)
        db.commit()
        db.refresh(cat)

        res = auth_client.post(f"/categories/{cat.uuid}/merge", json={"target_uuid": cat.uuid})
        assert res.status_code == 400

    def test_returns_404_for_missing_source(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        target = Category(user_uuid=str(test_user.uuid), name="食費")
        db.add(target)
        db.commit()
        db.refresh(target)

        res = auth_client.post("/categories/nonexistent/merge", json={"target_uuid": target.uuid})
        assert res.status_code == 404

    def test_returns_404_for_missing_target(self, auth_client: TestClient, test_user: User, db: Session) -> None:
        source = Category(user_uuid=str(test_user.uuid), name="外食")
        db.add(source)
        db.commit()
        db.refresh(source)

        res = auth_client.post(f"/categories/{source.uuid}/merge", json={"target_uuid": "nonexistent"})
        assert res.status_code == 404

    def test_returns_404_for_other_users_target(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        other = User(uuid="otheruser0000000000000000000000", name="other")
        db.add(other)
        db.commit()

        source = Category(user_uuid=str(test_user.uuid), name="外食")
        target = Category(user_uuid=str(other.uuid), name="食費")
        db.add_all([source, target])
        db.commit()
        db.refresh(source)
        db.refresh(target)

        res = auth_client.post(f"/categories/{source.uuid}/merge", json={"target_uuid": target.uuid})
        assert res.status_code == 404
