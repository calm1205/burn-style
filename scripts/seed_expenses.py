"""Expense テーブルに seed データを投入するスクリプト"""
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.orm import Session

# プロジェクトのルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent))

# .envファイルから環境変数を読み込む(インポートの前に実行)
load_dotenv()

from src.model import Category, Expense  # noqa: E402
from src.repository.database import SessionLocal  # noqa: E402


def seed_expenses() -> None:
    """Expense テーブルに seed データを投入"""
    db: Session = SessionLocal()
    try:
        # カテゴリを名前で取得(名前をキーとした辞書を作成)
        categories = db.query(Category).all()
        categories_dict = {category.name: category for category in categories}

        if not categories_dict:
            print("エラー: カテゴリが存在しません。先に seed_categories.py を実行してください。")
            return

        # seed データの定義
        expense_data = [
            {"name": "スーパーマーケットでの買い物", "amount": 3500, "category_names": ["食費"]},
            {"name": "電車代", "amount": 280, "category_names": ["交通費"]},
            {"name": "映画鑑賞", "amount": 1800, "category_names": ["娯楽"]},
            {"name": "電気代", "amount": 4500, "category_names": ["光熱費"]},
            {"name": "スマートフォン料金", "amount": 3500, "category_names": ["通信費"]},
            {"name": "病院の診察料", "amount": 5000, "category_names": ["医療費"]},
            {"name": "書籍代", "amount": 1200, "category_names": ["教育費"]},
            {"name": "給与", "amount": 300000, "category_names": ["給与"]},
            {"name": "ボーナス", "amount": 500000, "category_names": ["賞与"]},
            {"name": "副業収入", "amount": 50000, "category_names": ["その他収入"]},
            {"name": "コンビニでの買い物", "amount": 500, "category_names": ["食費"]},
            {"name": "バス代", "amount": 210, "category_names": ["交通費"]},
            {"name": "ゲームソフト購入", "amount": 6000, "category_names": ["娯楽"]},
            {"name": "ガス代", "amount": 3200, "category_names": ["光熱費"]},
            {"name": "インターネット料金", "amount": 4000, "category_names": ["通信費"]},
            {"name": "薬代", "amount": 2000, "category_names": ["医療費"]},
            {"name": "オンライン講座", "amount": 15000, "category_names": ["教育費"]},
            {"name": "外食", "amount": 2500, "category_names": ["食費", "娯楽"]},
            {"name": "タクシー代", "amount": 1200, "category_names": ["交通費"]},
            {"name": "コンサートチケット", "amount": 8000, "category_names": ["娯楽"]},
        ]

        # データを投入
        expenses = []
        for data in expense_data:
            expense = Expense(
                name=data["name"],
                amount=data["amount"],
            )
            # カテゴリを関連付け
            category_names = data.get("category_names", [])
            expense.categories = [
                categories_dict[name] for name in category_names if name in categories_dict
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

    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_expenses()
