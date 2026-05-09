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
        assert data["symbol"] is None
        assert "uuid" in data

    def test_creates_with_symbol(self, auth_client: TestClient) -> None:
        res = auth_client.post("/categories", json={"name": "食費", "symbol": "🍎"})
        assert res.status_code == 201
        assert res.json()["symbol"] == "🍎"

    def test_rejects_too_long_symbol(self, auth_client: TestClient) -> None:
        res = auth_client.post(
            "/categories", json={"name": "x", "symbol": "abcdefghi"},
        )
        assert res.status_code == 422

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

    def test_updates_symbol(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        cat = Category(user_uuid=str(test_user.uuid), name="食費")
        db.add(cat)
        db.commit()
        db.refresh(cat)

        res = auth_client.patch(f"/categories/{cat.uuid}", json={"symbol": "🍱"})
        assert res.status_code == 200
        assert res.json()["symbol"] == "🍱"
        assert res.json()["name"] == "食費"

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


class TestReorderCategories:
    def _create_three(self, db: Session, user: User) -> list[Category]:
        cats = [
            Category(user_uuid=str(user.uuid), name=f"cat{i}", position=i)
            for i in range(3)
        ]
        db.add_all(cats)
        db.commit()
        for c in cats:
            db.refresh(c)
        return cats

    def test_reorders_categories(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        cats = self._create_three(db, test_user)
        new_order = [cats[2].uuid, cats[0].uuid, cats[1].uuid]

        res = auth_client.put("/categories/order", json={"uuids": new_order})
        assert res.status_code == 200

        listed = auth_client.get("/categories").json()
        assert [c["uuid"] for c in listed] == new_order
        assert [c["position"] for c in listed] == [0, 1, 2]

    def test_rejects_partial_uuids(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        cats = self._create_three(db, test_user)
        res = auth_client.put("/categories/order", json={"uuids": [cats[0].uuid]})
        assert res.status_code == 400

    def test_rejects_unknown_uuid(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        cats = self._create_three(db, test_user)
        res = auth_client.put(
            "/categories/order",
            json={"uuids": [cats[0].uuid, cats[1].uuid, "nonexistent"]},
        )
        assert res.status_code == 400


class TestCategoryListOrder:
    def test_returns_in_position_order(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        c1 = Category(user_uuid=str(test_user.uuid), name="a", position=2)
        c2 = Category(user_uuid=str(test_user.uuid), name="b", position=0)
        c3 = Category(user_uuid=str(test_user.uuid), name="c", position=1)
        db.add_all([c1, c2, c3])
        db.commit()

        listed = auth_client.get("/categories").json()
        assert [c["name"] for c in listed] == ["b", "c", "a"]


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
        body = res.json()
        assert body["uuid"] == target.uuid
        assert body["name"] == target.name

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

    def test_compacts_positions_after_merge(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        a = Category(user_uuid=str(test_user.uuid), name="a", position=0)
        b = Category(user_uuid=str(test_user.uuid), name="b", position=1)
        c = Category(user_uuid=str(test_user.uuid), name="c", position=2)
        db.add_all([a, b, c])
        db.commit()
        db.refresh(a)
        db.refresh(b)
        db.refresh(c)

        # 真ん中の b を a に統合 → b の隙間 (position=1) を c が埋める
        res = auth_client.post(f"/categories/{b.uuid}/merge", json={"target_uuid": a.uuid})
        assert res.status_code == 200

        listed = auth_client.get("/categories").json()
        assert [(c["name"], c["position"]) for c in listed] == [("a", 0), ("c", 1)]
