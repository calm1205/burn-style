from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import TYPE_CHECKING

from dateutil.relativedelta import relativedelta

from src.domain.expense import Expense
from src.domain.expense_category_association import ExpenseCategoryAssociation
from src.domain.recurring_expense import IntervalUnit
from src.infrastructure import recurring_expense_repository
from src.presentation.schema.types import JST

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from src.domain.recurring_expense import RecurringExpense


def jst_today() -> date:
    """JSTの今日の日付を返す (date.today()はOS-tz依存のため不可)。"""
    return datetime.now(JST).date()


def offset_from_start(unit: IntervalUnit, count: int, n: int) -> relativedelta | timedelta:
    """n回目 (0-indexed) の発生日 = start_date + 本オフセット を算出。"""
    if unit is IntervalUnit.WEEK:
        return timedelta(weeks=count * n)
    return relativedelta(months=count * n)


def occurrence_date(start: date, unit: IntervalUnit, count: int, n: int) -> date:
    """start_date起点でのn回目 (0-indexed) の発生日を返す。"""
    return start + offset_from_start(unit, count, n)


def missed_dates(
    recurring: RecurringExpense, recorded_count: int, today: date,
) -> list[date]:
    """期日到来で未記録の発生日リストを返す (today・end_dateで打ち切り)。"""
    missed: list[date] = []
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
        missed.append(d)
        n += 1
    return missed


def record_occurrences(
    db: Session,
    recurring: RecurringExpense,
    count: int,
    expensed_at_override: date | None = None,
) -> int:
    """定期支払に紐づくExpenseをcount件生成 (expensed_atは算出日付か上書き値)。作成件数を返す。"""
    linked_expense_count = recurring_expense_repository.count_linked_expenses(db, str(recurring.uuid))
    created = 0
    for i in range(count):
        if expensed_at_override is not None:
            expensed_at = datetime.combine(expensed_at_override, datetime.min.time())
        else:
            occurrence = occurrence_date(
                recurring.start_date,  # type: ignore[arg-type]
                recurring.interval_unit,  # type: ignore[arg-type]
                recurring.interval_count,  # type: ignore[arg-type]
                linked_expense_count + i,
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
