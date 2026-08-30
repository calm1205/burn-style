from __future__ import annotations

from typing import TYPE_CHECKING

from src.infrastructure import cron_recurring_expense_repository, recurring_expense_repository
from src.service import recurring_expense_service

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


def record_due_recurring_occurrences(db: Session) -> tuple[int, int]:
    """全ユーザーの未削除定期支払を処理。返り値は (recorded_count, processed_recurring_count)。"""
    today = recurring_expense_service.jst_today()
    recurring_expenses = cron_recurring_expense_repository.get_all_recurring_expenses(db)
    total_recorded = 0
    processed = 0
    for recurring_expense in recurring_expenses:
        linked_expense_count = recurring_expense_repository.count_linked_expenses(
            db, str(recurring_expense.uuid),
        )
        dates = recurring_expense_service.missed_dates(recurring_expense, linked_expense_count, today)
        if not dates:
            continue
        total_recorded += recurring_expense_service.record_occurrences(
            db, recurring_expense, count=len(dates),
        )
        processed += 1
    return total_recorded, processed
