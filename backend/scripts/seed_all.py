"""Category、Expense テーブルに順番に seed データを投入するスクリプト

既存データ(users, webauthn_credentials以外)を削除してからクリーンに再投入する。

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
from src.model import Category, Expense  # noqa: E402
from src.model.expense_category_association import ExpenseCategoryAssociation  # noqa: E402
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


def delete_existing_data(db: Session, user: User) -> None:
    """対象ユーザーのseedデータを全削除(FK制約を考慮した順序)"""
    # 1. 中間テーブル(expense_category_association)
    assoc_count = db.query(ExpenseCategoryAssociation).filter(
        ExpenseCategoryAssociation.expense_uuid.in_(
            db.query(Expense.uuid).filter(Expense.user_uuid == user.uuid),
        ),
    ).delete(synchronize_session=False)

    # 2. expenses
    expense_count = db.query(Expense).filter(Expense.user_uuid == user.uuid).delete(synchronize_session=False)

    # 3. categories
    category_count = db.query(Category).filter(Category.user_uuid == user.uuid).delete(synchronize_session=False)

    db.commit()

    print(f"既存データを削除: カテゴリ {category_count}件, 支出 {expense_count}件, "
          f"関連付け {assoc_count}件")


def seed_all(user_name: str | None = None) -> None:
    """既存データを削除し、Category、Expense テーブルにクリーンに seed データを投入"""
    db: Session = get_session_local()()
    try:
        user = resolve_user(db, user_name)
        print("=" * 60)
        print(f"対象ユーザー: {user.name} (UUID: {user.uuid})")
        print("=" * 60)
        print()

        # 0. 既存データの削除
        print("[0/2] 既存データの削除...")
        print("-" * 60)
        delete_existing_data(db, user)
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
