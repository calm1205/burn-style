"""Category と Expense テーブルに seed データを投入するスクリプト"""
import os
import sys

from dotenv import load_dotenv
from sqlalchemy.orm import Session

# プロジェクトのルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# .envファイルから環境変数を読み込む（インポートの前に実行）
load_dotenv()

from src.repository.database import SessionLocal  # noqa: E402
from src.model import Category, Expense  # noqa: E402


def seed_categories(db: Session) -> dict[str, Category]:
    """Category テーブルに seed データを投入し、名前をキーとした辞書を返す"""
    # 既存のカテゴリを確認
    existing_categories = db.query(Category).count()
    if existing_categories > 0:
        print(f"既に {existing_categories} 個のカテゴリが存在します。")
        response = input("続行しますか？ (y/n): ")
        if response.lower() != "y":
            print("処理をキャンセルしました。")
            return {}

    # seed データの定義
    category_data = [
        {"name": "食費"},
        {"name": "交通費"},
        {"name": "娯楽"},
        {"name": "光熱費"},
        {"name": "通信費"},
        {"name": "医療費"},
        {"name": "教育費"},
        {"name": "給与"},
        {"name": "賞与"},
        {"name": "その他収入"},
    ]

    # データを投入
    categories = [Category(**data) for data in category_data]
    db.add_all(categories)
    db.commit()

    # リフレッシュしてUUIDを取得
    for category in categories:
        db.refresh(category)

    print(f"{len(categories)} 個のカテゴリを追加しました。")
    for category in categories:
        print(f"  - {category.name} (UUID: {category.uuid})")

    # 名前をキーとした辞書を返す
    return {category.name: category for category in categories}


def seed_expenses(db: Session, categories: dict[str, Category]) -> None:
    """Expense テーブルに seed データを投入"""
    # 既存の支出を確認
    existing_expenses = db.query(Expense).count()
    if existing_expenses > 0:
        print(f"既に {existing_expenses} 件の支出が存在します。")
        response = input("続行しますか？ (y/n): ")
        if response.lower() != "y":
            print("処理をキャンセルしました。")
            return

    # seed データの定義
    expense_data = [
        {"name": "スーパーマーケットでの買い物", "amount": -3500.0, "category_names": ["食費"]},
        {"name": "電車代", "amount": -280.0, "category_names": ["交通費"]},
        {"name": "映画鑑賞", "amount": -1800.0, "category_names": ["娯楽"]},
        {"name": "電気代", "amount": -4500.0, "category_names": ["光熱費"]},
        {"name": "スマートフォン料金", "amount": -3500.0, "category_names": ["通信費"]},
        {"name": "病院の診察料", "amount": -5000.0, "category_names": ["医療費"]},
        {"name": "書籍代", "amount": -1200.0, "category_names": ["教育費"]},
        {"name": "給与", "amount": 300000.0, "category_names": ["給与"]},
        {"name": "ボーナス", "amount": 500000.0, "category_names": ["賞与"]},
        {"name": "副業収入", "amount": 50000.0, "category_names": ["その他収入"]},
        {"name": "コンビニでの買い物", "amount": -500.0, "category_names": ["食費"]},
        {"name": "バス代", "amount": -210.0, "category_names": ["交通費"]},
        {"name": "ゲームソフト購入", "amount": -6000.0, "category_names": ["娯楽"]},
        {"name": "ガス代", "amount": -3200.0, "category_names": ["光熱費"]},
        {"name": "インターネット料金", "amount": -4000.0, "category_names": ["通信費"]},
        {"name": "薬代", "amount": -2000.0, "category_names": ["医療費"]},
        {"name": "オンライン講座", "amount": -15000.0, "category_names": ["教育費"]},
        {"name": "外食", "amount": -2500.0, "category_names": ["食費", "娯楽"]},
        {"name": "タクシー代", "amount": -1200.0, "category_names": ["交通費"]},
        {"name": "コンサートチケット", "amount": -8000.0, "category_names": ["娯楽"]},
    ]

    # データを投入
    expenses = []
    for data in expense_data:
        expense = Expense(
            name=data["name"],
            amount=data["amount"]
        )
        # カテゴリを関連付け
        category_names = data.get("category_names", [])
        expense.categories = [
            categories[name] for name in category_names if name in categories
        ]
        expenses.append(expense)

    db.add_all(expenses)
    db.commit()

    # リフレッシュしてUUIDを取得
    for expense in expenses:
        db.refresh(expense)

    print(f"{len(expenses)} 件の支出を追加しました。")
    for expense in expenses:
        category_names = ", ".join([cat.name for cat in expense.categories])
        print(f"  - {expense.name}: {expense.amount:,.0f}円 (カテゴリ: {category_names})")


def seed_expenses_and_categories() -> None:
    """Category と Expense テーブルに seed データを投入"""
    db: Session = SessionLocal()
    try:
        # まずカテゴリを投入
        categories = seed_categories(db)
        
        # カテゴリが空の場合は処理を終了
        if not categories:
            print("カテゴリの投入がキャンセルされたため、支出の投入をスキップします。")
            return

        # 支出を投入
        seed_expenses(db, categories)

    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_expenses_and_categories()

