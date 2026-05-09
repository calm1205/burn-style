from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import TYPE_CHECKING

from dateutil.relativedelta import relativedelta

from src.model.expense import Expense
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.model.recurring_expense import IntervalUnit
from src.repository import recurring_expense_repository
from src.schema.types import JST

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from src.model.recurring_expense import RecurringExpense


def jst_today() -> date:
    """Return today's date in JST. Avoid date.today() (OS-tz dependent)."""
    return datetime.now(JST).date()


def offset_from_start(unit: IntervalUnit, count: int, n: int) -> relativedelta | timedelta:
    """Compute the offset to add to start_date for the n-th occurrence (0-indexed)."""
    if unit is IntervalUnit.WEEK:
        return timedelta(weeks=count * n)
    return relativedelta(months=count * n)


def occurrence_date(start: date, unit: IntervalUnit, count: int, n: int) -> date:
    """Return the date of the n-th occurrence (0-indexed) starting from start_date."""
    return start + offset_from_start(unit, count, n)


def missed_dates(
    recurring: RecurringExpense, recorded_count: int, today: date,
) -> list[date]:
    """Return dates that are due but not yet recorded.

    Iterates from the (recorded_count)-th occurrence forward, collecting dates
    that are <= today and (if end_date is set) <= end_date.
    """
    result: list[date] = []
    n = recorded_count
    while True:
        d = occurrence_date(
            recurring.start_date,  # type: ignore[arg-type]
            recurring.interval_unit,  # type: ignore[arg-type]
            recurring.interval_count,  # type: ignore[arg-type]
            n,
        )
        if d > today:
            break
        if recurring.end_date is not None and d > recurring.end_date:
            break
        result.append(d)
        n += 1
    return result


def record_occurrences(
    db: Session,
    recurring: RecurringExpense,
    count: int,
    expensed_at_override: date | None = None,
) -> int:
    """Create `count` Expense rows linked to this recurring expense.

    Uses computed occurrence dates as `expensed_at` unless overridden.
    Returns the number of records created.
    """
    recorded = recurring_expense_repository.count_recorded(db, str(recurring.uuid))
    created = 0
    for i in range(count):
        if expensed_at_override is not None:
            expensed_at = datetime.combine(expensed_at_override, datetime.min.time())
        else:
            occurrence = occurrence_date(
                recurring.start_date,  # type: ignore[arg-type]
                recurring.interval_unit,  # type: ignore[arg-type]
                recurring.interval_count,  # type: ignore[arg-type]
                recorded + i,
            )
            expensed_at = datetime.combine(occurrence, datetime.min.time())

        expense = Expense(
            user_uuid=recurring.user_uuid,
            name=recurring.name,
            amount=recurring.amount,
            expensed_at=expensed_at,
            recurring_expense_uuid=recurring.uuid,
        )
        db.add(expense)
        db.flush()
        db.add(
            ExpenseCategoryAssociation(
                expense_uuid=expense.uuid,
                category_uuid=recurring.category_uuid,
            ),
        )
        created += 1

    db.commit()
    return created


def record_all_due_for_cron(db: Session) -> tuple[int, int]:
    """Process all active recurring expenses across users.

    Returns (recorded_count, processed_recurring_count).
    """
    today = jst_today()
    recurrings = recurring_expense_repository.get_all_active_for_cron(db)
    total_recorded = 0
    processed = 0
    for r in recurrings:
        recorded = recurring_expense_repository.count_recorded(db, str(r.uuid))
        dates = missed_dates(r, recorded, today)
        if not dates:
            continue
        total_recorded += record_occurrences(db, r, count=len(dates))
        processed += 1
    return total_recorded, processed
