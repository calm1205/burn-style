"""Category、Expense テーブルに順番に seed データを投入するスクリプト

Usage:
    uv run python scripts/seed_all.py              # 1件目のユーザーを使用
    uv run python scripts/seed_all.py <user_name>  # 指定ユーザーを使用
"""
import sys
from pathlib import Path

from dotenv import load_dotenv

# プロジェクトのルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent))

# .envファイルから環境変数を読み込む(インポートの前に実行)
load_dotenv()

from sqlalchemy.orm import Session  # noqa: E402

from scripts.seed_categories import seed_categories  # noqa: E402
from scripts.seed_expenses import seed_expenses  # noqa: E402
from src.model.user import User  # noqa: E402
from src.repository.database import get_session_local  # noqa: E402


def resolve_user(db: Session, user_name: str | None) -> User:
    """ユーザーを取得。名前指定があれば検索、なければ1件目を返す"""
    if user_name:
        user = db.query(User).filter(User.name == user_name).first()
        if not user:
            raise RuntimeError(f"ユーザー '{user_name}' が見つかりません")
    else:
        user = db.query(User).first()
        if not user:
            print("ユーザーが存在しません。サインアップ後に再実行してください。")
            sys.exit(0)
    return user


def seed_all(user_name: str | None = None) -> None:
    """Category、Expense テーブルに順番に seed データを投入"""
    db: Session = get_session_local()()
    try:
        user = resolve_user(db, user_name)
        print("=" * 60)
        print(f"対象ユーザー: {user.name} (UUID: {user.uuid})")
        print("=" * 60)
        print()

        # 1. カテゴリを投入
        print("[1/2] カテゴリの投入を開始します...")
        print("-" * 60)
        seed_categories(db, user)
        print()

        # 2. エクスペンスを投入
        print("[2/2] エクスペンスの投入を開始します...")
        print("-" * 60)
        seed_expenses(db, user)
        print()

        print("=" * 60)
        print("すべてのシードデータの投入が完了しました")
        print("=" * 60)

    except Exception as e:
        print()
        print("=" * 60)
        print(f"エラーが発生しました: {e}")
        print("=" * 60)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else None
    seed_all(name)
