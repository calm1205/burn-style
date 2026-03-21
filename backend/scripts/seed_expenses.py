"""Expense テーブルに seed データを投入するスクリプト

直近3年分のリアルなデータを生成(月ごとにカテゴリ別のパターン)
"""
import random
from datetime import UTC, datetime, timedelta
from typing import TypedDict

from sqlalchemy.orm import Session

from src.model import Category, Expense
from src.model.user import User

# 再現性のための固定シード
RANDOM_SEED = 42

DECEMBER = 12


class CategoryPattern(TypedDict):
    names: list[str]
    count: tuple[int, int]
    amount: tuple[int, int]


MONTHLY_PATTERNS: dict[str, CategoryPattern] = {
    "食費": {
        "names": [
            "スーパー", "コンビニ", "外食ランチ", "外食ディナー",
            "カフェ", "デリバリー", "ドラッグストア食品", "パン屋",
        ],
        "count": (8, 15),
        "amount": (300, 8000),
    },
    "交通費": {
        "names": ["電車代", "バス代", "タクシー代", "定期券", "ガソリン代", "駐車場代", "高速道路"],
        "count": (3, 8),
        "amount": (200, 5000),
    },
    "娯楽": {
        "names": [
            "映画", "書籍", "ゲーム", "サブスク(動画)", "サブスク(音楽)",
            "カラオケ", "ボウリング", "飲み会", "旅行", "コンサート",
        ],
        "count": (2, 6),
        "amount": (500, 15000),
    },
    "光熱費": {
        "names": ["電気代", "ガス代", "水道代"],
        "count": (2, 3),
        "amount": (2000, 8000),
    },
    "通信費": {
        "names": ["スマートフォン料金", "インターネット料金"],
        "count": (1, 2),
        "amount": (2000, 6000),
    },
    "医療費": {
        "names": ["病院(内科)", "病院(歯科)", "薬代", "健康診断"],
        "count": (0, 2),
        "amount": (1000, 10000),
    },
    "教育費": {
        "names": ["書籍(技術書)", "オンライン講座", "セミナー参加費", "資格試験"],
        "count": (0, 2),
        "amount": (1000, 20000),
    },
}


def _random_date_in_month(year: int, month: int, rng: random.Random) -> datetime:
    """指定月内のランダムな日時を生成"""
    start = datetime(year, month, 1, tzinfo=UTC)
    if month == DECEMBER:
        next_month_start = datetime(year + 1, 1, 1, tzinfo=UTC)
    else:
        next_month_start = datetime(year, month + 1, 1, tzinfo=UTC)
    delta = (next_month_start - start).days
    day_offset = rng.randint(0, delta - 1)
    hour = rng.randint(7, 22)
    minute = rng.randint(0, 59)
    return start + timedelta(days=day_offset, hours=hour, minutes=minute)


class ExpenseRecord(TypedDict):
    name: str
    amount: int
    expensed_at: datetime
    created_at: datetime
    category_names: list[str]


def _generate_expenses(rng: random.Random) -> list[ExpenseRecord]:
    """3年分の支出データを生成"""
    now = datetime.now(UTC)
    records: list[ExpenseRecord] = []

    for year_offset in range(3):
        year = now.year - 2 + year_offset
        for month in range(1, 13):
            # 未来月はスキップ
            if datetime(year, month, 1, tzinfo=UTC) > now:
                break

            for category_name, pattern in MONTHLY_PATTERNS.items():
                count = rng.randint(pattern["count"][0], pattern["count"][1])

                for _ in range(count):
                    amount = rng.randint(pattern["amount"][0], pattern["amount"][1])
                    # 100円単位に丸め
                    amount = max(100, (amount // 100) * 100)

                    expensed_at = _random_date_in_month(year, month, rng)
                    records.append({
                        "name": rng.choice(pattern["names"]),
                        "amount": amount,
                        "expensed_at": expensed_at,
                        "created_at": expensed_at,
                        "category_names": [category_name],
                    })

    return records


def seed_expenses(db: Session, user: User) -> None:
    """Expense テーブルに3年分の seed データを投入(既存データがあればスキップ)"""
    existing_count = db.query(Expense).filter(Expense.user_uuid == user.uuid).count()
    if existing_count > 0:
        print(f"既に {existing_count} 件の支出が存在します。スキップ。")
        return

    categories = db.query(Category).filter(Category.user_uuid == user.uuid).all()
    categories_dict: dict[str, Category] = {str(c.name): c for c in categories}

    if not categories_dict:
        raise RuntimeError("カテゴリが存在しません。先にカテゴリを投入してください。")

    rng = random.Random(RANDOM_SEED)  # noqa: S311
    records = _generate_expenses(rng)

    expenses = []
    for record in records:
        expense = Expense(
            user_uuid=user.uuid,
            name=record["name"],
            amount=record["amount"],
            expensed_at=record["expensed_at"],
            created_at=record["created_at"],
        )
        expense.categories = [
            categories_dict[name]
            for name in record["category_names"]
            if name in categories_dict
        ]
        expenses.append(expense)

    db.add_all(expenses)
    db.commit()

    # 集計表示
    by_year: dict[int, int] = {}
    for record in records:
        y = record["created_at"].year
        by_year[y] = by_year.get(y, 0) + 1

    print(f"{len(expenses)} 件の支出を追加しました。")
    for y in sorted(by_year):
        print(f"  {y}年: {by_year[y]} 件")
