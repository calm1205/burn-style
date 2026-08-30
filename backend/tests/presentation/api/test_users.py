from __future__ import annotations

from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.domain.category import Category
from src.domain.expense import Expense, VibeNecessity, VibeSocial
from src.domain.user import User

SAMPLE_EXPENSED_AT = "2025-03-15T12:00:00+09:00"
SAMPLE_VIBE = {
    "social": "SOLO",
    "planning": "ROUTINE",
    "necessity": "NEEDED",
}


def _create_category(db: Session, user: User, name: str = "food") -> Category:
    category = Category(user_uuid=str(user.uuid), name=name, symbol="🍴", position=0)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


class TestExportImport:
    def test_round_trips_nested_vibe(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        category = _create_category(db, test_user)
        auth_client.post("/expenses", json={
            "name": "lunch",
            "amount": 800,
            "expensed_at": SAMPLE_EXPENSED_AT,
            "category_uuid": category.uuid,
            "vibe": SAMPLE_VIBE,
        })

        export_res = auth_client.get("/me/export")
        assert export_res.status_code == 200
        snapshot = export_res.json()
        assert snapshot["expenses"][0]["vibe"] == SAMPLE_VIBE
        assert "vibe_social" not in snapshot["expenses"][0]

        auth_client.post("/me/import", json=snapshot)
        list_res = auth_client.get("/expenses")
        assert list_res.json()[0]["vibe"] == SAMPLE_VIBE

    def test_partial_vibe_in_db_exports_each_field(
        self, auth_client: TestClient, test_user: User, db: Session,
    ) -> None:
        expense = Expense(
            user_uuid=str(test_user.uuid),
            name="partial",
            amount=100,
            expensed_at=datetime.now(UTC),
            vibe_social=VibeSocial.SOLO,
            vibe_planning=None,
            vibe_necessity=VibeNecessity.NEEDED,
        )
        db.add(expense)
        db.commit()

        export_res = auth_client.get("/me/export")
        assert export_res.json()["expenses"][0]["vibe"] == {
            "social": "SOLO",
            "planning": None,
            "necessity": "NEEDED",
        }
