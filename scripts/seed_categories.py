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
from src.model import Category, User  # noqa: E402


def seed_categories() -> None:
    """Category テーブルに seed データを投入"""
    db: Session = SessionLocal()
    try:
        # 既存のユーザーを取得
        users = db.query(User).all()
        if not users:
            print("警告: ユーザーが存在しません。先にユーザーを投入してください。")
            return

        # seed データの定義
        category_names = [
            "食費",
            "交通費",
            "娯楽",
            "光熱費",
            "通信費",
            "医療費",
            "教育費",
            "給与",
            "賞与",
            "その他収入",
        ]

        # 各ユーザーに対してカテゴリを作成
        all_categories = []
        for user in users:
            categories = [
                Category(name=name, user_uuid=user.uuid) for name in category_names
            ]
            all_categories.extend(categories)

        # データを投入
        db.add_all(all_categories)
        db.commit()

        # リフレッシュしてUUIDを取得
        for category in all_categories:
            db.refresh(category)

        print(f"{len(all_categories)} 個のカテゴリを追加しました。")
        for user in users:
            user_categories = [c for c in all_categories if c.user_uuid == user.uuid]
            print(f"  {user.name} のカテゴリ ({len(user_categories)} 個):")
            for category in user_categories:
                print(f"    - {category.name} (UUID: {category.uuid})")

    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_categories()

