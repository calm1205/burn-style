"""Category テーブルに seed データを投入するスクリプト"""
import os
import sys

from dotenv import load_dotenv
from sqlalchemy.orm import Session

# プロジェクトのルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# .envファイルから環境変数を読み込む（インポートの前に実行）
load_dotenv()

from src.repository.database import SessionLocal  # noqa: E402
from src.model import Category  # noqa: E402


def seed_categories() -> None:
    """Category テーブルに seed データを投入"""
    db: Session = SessionLocal()
    try:
        # 既存のカテゴリを確認
        existing_categories = db.query(Category).count()
        if existing_categories > 0:
            print(f"既に {existing_categories} 個のカテゴリが存在します。")
            response = input("続行しますか？ (y/n): ")
            if response.lower() != "y":
                print("処理をキャンセルしました。")
                return

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

    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_categories()

