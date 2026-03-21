"""Category テーブルに seed データを投入するスクリプト"""
from sqlalchemy.orm import Session

from src.model import Category
from src.model.user import User

CATEGORY_NAMES = [
    "食費",
    "交通費",
    "娯楽",
    "光熱費",
    "通信費",
    "医療費",
    "教育費",
]


def seed_categories(db: Session, user: User) -> None:
    """Category テーブルに seed データを投入(既存カテゴリはスキップ)"""
    existing = {
        str(c.name)
        for c in db.query(Category).filter(Category.user_uuid == user.uuid).all()
    }

    new_names = [name for name in CATEGORY_NAMES if name not in existing]
    if not new_names:
        print("すべてのカテゴリが既に存在します。スキップ。")
        return

    categories = [Category(user_uuid=user.uuid, name=name) for name in new_names]
    db.add_all(categories)
    db.commit()

    for category in categories:
        db.refresh(category)

    print(f"{len(categories)} 個のカテゴリを追加しました。")
    for category in categories:
        print(f"  - {category.name} (UUID: {category.uuid})")
