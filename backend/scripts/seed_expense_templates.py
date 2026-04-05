"""ExpenseTemplate テーブルに seed データを投入するスクリプト"""
from sqlalchemy.orm import Session

from src.model import Category
from src.model.expense_template import ExpenseTemplate
from src.model.user import User

TEMPLATE_DATA = [
    {"name": "Netflix", "amount": 1490, "category": "娯楽"},
    {"name": "Spotify", "amount": 980, "category": "娯楽"},
    {"name": "電気代", "amount": 8000, "category": "光熱費"},
    {"name": "ガス代", "amount": 4000, "category": "光熱費"},
    {"name": "水道代", "amount": 3000, "category": "光熱費"},
    {"name": "スマホ代", "amount": 3000, "category": "通信費"},
    {"name": "インターネット", "amount": 5000, "category": "通信費"},
]


def seed_expense_templates(db: Session, user: User) -> None:
    """ExpenseTemplate テーブルに seed データを投入(既存テンプレートはスキップ)"""
    existing = {
        str(t.name)
        for t in db.query(ExpenseTemplate).filter(
            ExpenseTemplate.user_uuid == user.uuid,
            ExpenseTemplate.deleted_at.is_(None),
        ).all()
    }

    categories = {
        str(c.name): c
        for c in db.query(Category).filter(Category.user_uuid == user.uuid).all()
    }

    new_templates = [d for d in TEMPLATE_DATA if d["name"] not in existing]
    if not new_templates:
        print("すべてのテンプレートが既に存在します。スキップ。")
        return

    templates = []
    for data in new_templates:
        category_name = str(data["category"])
        category = categories.get(category_name)
        if not category:
            print(f"  - カテゴリ '{data['category']}' が見つかりません。'{data['name']}' をスキップ。")
            continue
        templates.append(
            ExpenseTemplate(
                user_uuid=user.uuid,
                name=data["name"],
                amount=data["amount"],
                category_uuid=category.uuid,
            ),
        )

    if not templates:
        print("追加対象のテンプレートがありません。")
        return

    db.add_all(templates)
    db.commit()

    for t in templates:
        db.refresh(t)

    print(f"{len(templates)} 個のテンプレートを追加しました。")
    for t in templates:
        print(f"  - {t.name} ¥{t.amount:,}")
