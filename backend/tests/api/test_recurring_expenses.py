from __future__ import annotations

import os
from collections.abc import Generator
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.main import app
from src.model.category import Category
from src.model.expense import Expense
from src.model.recurring_expense import IntervalUnit, RecurringExpense
from src.model.user import User
from src.repository.database import get_db
from src.service import recurring_expense_service

_TEST_CRON_SECRET = "test-cron-secret"  # noqa: S105


@pytest.fixture(autouse=True)
def cron_secret() -> Generator[str]:
    """Set CRON_SECRET for tests using the cron endpoint."""
    os.environ["CRON_SECRET"] = _TEST_CRON_SECRET
    yield _TEST_CRON_SECRET
    os.environ.pop("CRON_SECRET", None)


@pytest.fixture
def category(db: Session, test_user: User) -> Category:
    cat = Category(user_uuid=str(test_user.uuid), name="住居費")
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def _make_payload(category_uuid: str, **overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "name": "家賃",
        "amount": 80000,
        "category_uuid": category_uuid,
        "interval_unit": "MONTH",
        "interval_count": 1,
        "start_date": "2026-01-01",
    }
    payload.update(overrides)
    return payload


class TestCreate:
    def test_creates_recurring(self, auth_client: TestClient, category: Category) -> None:
        res = auth_client.post("/recurring-expenses", json=_make_payload(str(category.uuid)))
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "家賃"
        assert data["amount"] == 80000
        assert data["interval_unit"] == "MONTH"
        assert data["interval_count"] == 1
        assert data["start_date"] == "2026-01-01"
        assert data["end_date"] is None
        assert data["category"]["uuid"] == category.uuid

    def test_rejects_zero_amount(self, auth_client: TestClient, category: Category) -> None:
        res = auth_client.post(
            "/recurring-expenses", json=_make_payload(str(category.uuid), amount=0),
        )
        assert res.status_code == 422

    def test_rejects_zero_interval_count(self, auth_client: TestClient, category: Category) -> None:
        res = auth_client.post(
            "/recurring-expenses", json=_make_payload(str(category.uuid), interval_count=0),
        )
        assert res.status_code == 422

    def test_rejects_unknown_category(self, auth_client: TestClient) -> None:
        res = auth_client.post("/recurring-expenses", json=_make_payload("nonexistent"))
        assert res.status_code == 400

    def test_rejects_end_before_start(self, auth_client: TestClient, category: Category) -> None:
        res = auth_client.post(
            "/recurring-expenses",
            json=_make_payload(str(category.uuid), end_date="2025-12-01"),
        )
        assert res.status_code == 400


class TestList:
    def test_excludes_soft_deleted(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        active = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="active",
            amount=1000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        deleted = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="deleted",
            amount=2000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add_all([active, deleted])
        db.commit()
        db.refresh(deleted)
        auth_client.delete(f"/recurring-expenses/{deleted.uuid}")

        res = auth_client.get("/recurring-expenses")
        assert res.status_code == 200
        names = [item["name"] for item in res.json()]
        assert names == ["active"]


class TestUpdate:
    def test_updates_amount(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="家賃",
            amount=80000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        res = auth_client.patch(f"/recurring-expenses/{r.uuid}", json={"amount": 85000})
        assert res.status_code == 200
        assert res.json()["amount"] == 85000

    def test_returns_404_for_other_user(
        self, auth_client: TestClient, db: Session,
    ) -> None:
        other = User(uuid="otheruser0000000000000000000000", name="other")
        db.add(other)
        db.commit()
        cat = Category(user_uuid="otheruser0000000000000000000000", name="食費")
        db.add(cat)
        db.commit()
        db.refresh(cat)
        r = RecurringExpense(
            user_uuid="otheruser0000000000000000000000",
            name="x",
            amount=1000,
            category_uuid=cat.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        res = auth_client.patch(f"/recurring-expenses/{r.uuid}", json={"amount": 1})
        assert res.status_code == 404


class TestDue:
    def test_returns_missed_dates_for_monthly(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="家賃",
            amount=80000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        # Force "today" via patching jst_today

        original = recurring_expense_service.jst_today
        recurring_expense_service.jst_today = lambda: date(2026, 3, 15)
        try:
            res = auth_client.get("/recurring-expenses/due")
        finally:
            recurring_expense_service.jst_today = original

        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1
        assert data[0]["missed_count"] == 3
        assert data[0]["missed_dates"] == ["2026-01-01", "2026-02-01", "2026-03-01"]

    def test_excludes_dates_after_end_date(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="家賃",
            amount=80000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
            end_date=date(2026, 2, 1),
        )
        db.add(r)
        db.commit()


        original = recurring_expense_service.jst_today
        recurring_expense_service.jst_today = lambda: date(2026, 5, 1)
        try:
            res = auth_client.get("/recurring-expenses/due")
        finally:
            recurring_expense_service.jst_today = original

        assert res.json()[0]["missed_dates"] == ["2026-01-01", "2026-02-01"]

    def test_excludes_future_start_date(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="future",
            amount=1000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2099, 1, 1),
        )
        db.add(r)
        db.commit()

        res = auth_client.get("/recurring-expenses/due")
        assert res.json() == []


class TestRecord:
    def test_creates_expense_with_computed_date(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="家賃",
            amount=80000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        res = auth_client.post(f"/recurring-expenses/{r.uuid}/record", json={"count": 1})
        assert res.status_code == 200
        assert res.json()["recorded_count"] == 1

        expense = db.query(Expense).filter(Expense.recurring_expense_uuid == r.uuid).first()
        assert expense is not None
        assert expense.expensed_at.date() == date(2026, 1, 1)
        assert expense.amount == 80000

    def test_creates_multiple_with_count(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="家賃",
            amount=80000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        res = auth_client.post(f"/recurring-expenses/{r.uuid}/record", json={"count": 3})
        assert res.status_code == 200
        assert res.json()["recorded_count"] == 3

        expenses = (
            db.query(Expense)
            .filter(Expense.recurring_expense_uuid == r.uuid)
            .order_by(Expense.expensed_at)
            .all()
        )
        assert [e.expensed_at.date() for e in expenses] == [
            date(2026, 1, 1), date(2026, 2, 1), date(2026, 3, 1),
        ]

    def test_month_end_does_not_drift(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        """1/31 monthly should yield 2/28 then 3/31 (start-anchored, no drift)."""
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="rent",
            amount=80000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 31),
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        auth_client.post(f"/recurring-expenses/{r.uuid}/record", json={"count": 3})

        expenses = (
            db.query(Expense)
            .filter(Expense.recurring_expense_uuid == r.uuid)
            .order_by(Expense.expensed_at)
            .all()
        )
        # 2026 is not a leap year → Feb 28
        assert [e.expensed_at.date() for e in expenses] == [
            date(2026, 1, 31), date(2026, 2, 28), date(2026, 3, 31),
        ]

    def test_biweekly_advances_14_days(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="invest",
            amount=10000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.WEEK,
            interval_count=2,
            start_date=date(2026, 1, 1),
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        auth_client.post(f"/recurring-expenses/{r.uuid}/record", json={"count": 3})

        expenses = (
            db.query(Expense)
            .filter(Expense.recurring_expense_uuid == r.uuid)
            .order_by(Expense.expensed_at)
            .all()
        )
        assert [e.expensed_at.date() for e in expenses] == [
            date(2026, 1, 1), date(2026, 1, 15), date(2026, 1, 29),
        ]

    def test_recorded_count_excludes_soft_deleted(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        """Soft-deleting the latest record allows re-recording to refill that occurrence."""
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="家賃",
            amount=80000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        auth_client.post(f"/recurring-expenses/{r.uuid}/record", json={"count": 2})
        latest = (
            db.query(Expense)
            .filter(Expense.recurring_expense_uuid == r.uuid)
            .order_by(Expense.expensed_at.desc())
            .first()
        )
        assert latest is not None
        auth_client.delete(f"/expenses/{latest.uuid}")

        auth_client.post(f"/recurring-expenses/{r.uuid}/record", json={"count": 1})
        active_dates = sorted(
            e.expensed_at.date()
            for e in db.query(Expense)
            .filter(Expense.recurring_expense_uuid == r.uuid, Expense.deleted_at.is_(None))
            .all()
        )
        assert active_dates == [date(2026, 1, 1), date(2026, 2, 1)]


class TestDelete:
    def test_soft_deletes(
        self, auth_client: TestClient, category: Category, db: Session, test_user: User,
    ) -> None:
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="家賃",
            amount=80000,
            category_uuid=category.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        res = auth_client.delete(f"/recurring-expenses/{r.uuid}")
        assert res.status_code == 204
        assert auth_client.get("/recurring-expenses").json() == []


class TestCron:
    def _override_db(self, db: Session) -> None:
        def _gen() -> Generator[Session]:
            yield db
        app.dependency_overrides[get_db] = _gen

    def test_unauthenticated(self, db: Session) -> None:
        self._override_db(db)
        try:
            client = TestClient(app)
            res = client.post("/cron/recurring-expenses/record-due")
            assert res.status_code == 401
        finally:
            app.dependency_overrides.clear()

    def test_records_all_due_across_users(
        self, db: Session, test_user: User,
    ) -> None:
        cat = Category(user_uuid=str(test_user.uuid), name="住居費")
        other_user = User(uuid="otheruser0000000000000000000000", name="other")
        db.add_all([cat, other_user])
        db.commit()
        other_cat = Category(user_uuid=str(other_user.uuid), name="食費")
        db.add(other_cat)
        db.commit()
        db.refresh(cat)
        db.refresh(other_cat)

        a = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="家賃",
            amount=80000,
            category_uuid=cat.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        b = RecurringExpense(
            user_uuid=str(other_user.uuid),
            name="食材",
            amount=5000,
            category_uuid=other_cat.uuid,
            interval_unit=IntervalUnit.WEEK,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add_all([a, b])
        db.commit()


        original = recurring_expense_service.jst_today
        recurring_expense_service.jst_today = lambda: date(2026, 1, 15)
        self._override_db(db)
        try:
            client = TestClient(app)
            res = client.post(
                "/cron/recurring-expenses/record-due",
                headers={"Authorization": "Bearer test-cron-secret"},
            )
        finally:
            recurring_expense_service.jst_today = original
            app.dependency_overrides.clear()

        assert res.status_code == 200
        body = res.json()
        # a: 1/1 (monthly) - 1 occurrence by 1/15
        # b: 1/1, 1/8, 1/15 (weekly) - 3 occurrences
        assert body["recorded_count"] == 4
        assert body["processed_recurring_count"] == 2

    def test_idempotent_when_called_twice(
        self, db: Session, test_user: User,
    ) -> None:
        cat = Category(user_uuid=str(test_user.uuid), name="住居費")
        db.add(cat)
        db.commit()
        db.refresh(cat)
        r = RecurringExpense(
            user_uuid=str(test_user.uuid),
            name="家賃",
            amount=80000,
            category_uuid=cat.uuid,
            interval_unit=IntervalUnit.MONTH,
            interval_count=1,
            start_date=date(2026, 1, 1),
        )
        db.add(r)
        db.commit()


        original = recurring_expense_service.jst_today
        recurring_expense_service.jst_today = lambda: date(2026, 3, 15)
        self._override_db(db)
        try:
            client = TestClient(app)
            first = client.post(
                "/cron/recurring-expenses/record-due",
                headers={"Authorization": "Bearer test-cron-secret"},
            )
            second = client.post(
                "/cron/recurring-expenses/record-due",
                headers={"Authorization": "Bearer test-cron-secret"},
            )
        finally:
            recurring_expense_service.jst_today = original
            app.dependency_overrides.clear()

        assert first.json()["recorded_count"] == 3
        assert second.json()["recorded_count"] == 0
