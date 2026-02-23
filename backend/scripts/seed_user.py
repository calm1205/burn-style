"""User テーブルに seed データを投入するスクリプト"""
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.orm import Session

# プロジェクトのルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent))

# .envファイルから環境変数を読み込む(インポートの前に実行)
load_dotenv()

from src.model.user import User  # noqa: E402
from src.repository.database import SessionLocal  # noqa: E402

SEED_USERNAME = "seed-user"


def seed_user() -> None:
    """User テーブルに seed データを投入(既存なら作成をスキップ)"""
    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == SEED_USERNAME).first()
        if existing:
            print(f"ユーザー '{SEED_USERNAME}' は既に存在します (UUID: {existing.uuid})")
            return

        user = User(username=SEED_USERNAME)
        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"ユーザーを作成しました: {user.username} (UUID: {user.uuid})")

    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_user()
