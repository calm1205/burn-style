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
    """定期支払に紐づくExpenseをcount件生成 (expensed_atは算出日付か上書き値)。作成件数を返す。"""
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
    """全ユーザーの未削除定期支払を処理。返り値は (recorded_count, processed_recurring_count)。"""
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
