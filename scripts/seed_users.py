"""User テーブルに seed データを投入するスクリプト"""
import os
import sys

from dotenv import load_dotenv
from sqlalchemy.orm import Session

# プロジェクトのルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# .envファイルから環境変数を読み込む（インポートの前に実行）
load_dotenv()

from src.repository.database import SessionLocal  # noqa: E402
from src.model import User  # noqa: E402


def seed_users() -> None:
    """User テーブルに seed データを投入"""
    db: Session = SessionLocal()
    try:
        # 既存のユーザーを確認
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"既に {existing_users} 人のユーザーが存在します。")
            response = input("続行しますか？ (y/n): ")
            if response.lower() != "y":
                print("処理をキャンセルしました。")
                return

        # seed データの定義
        seed_data = [
            {"name": "山田太郎"},
            {"name": "佐藤花子"},
            {"name": "鈴木一郎"},
            {"name": "田中次郎"},
            {"name": "伊藤三郎"},
        ]

        # データを投入
        users = [User(**data) for data in seed_data]
        db.add_all(users)
        db.commit()

        print(f"{len(users)} 人のユーザーを追加しました。")
        for user in users:
            print(f"  - {user.name} (UUID: {user.uuid})")

    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()

