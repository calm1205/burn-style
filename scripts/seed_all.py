"""User、Category、Expense テーブルに順番に seed データを投入するスクリプト"""
import os
import sys

from dotenv import load_dotenv

# プロジェクトのルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# .envファイルから環境変数を読み込む（インポートの前に実行）
load_dotenv()

from scripts.seed_users import seed_users  # noqa: E402
from scripts.seed_categories import seed_categories  # noqa: E402
from scripts.seed_expenses import seed_expenses  # noqa: E402


def seed_all() -> None:
    """User、Category、Expense テーブルに順番に seed データを投入"""
    print("=" * 60)
    print("シードデータの投入を開始します")
    print("=" * 60)
    print()

    try:
        # 1. ユーザーを投入
        print("[1/3] ユーザーの投入を開始します...")
        print("-" * 60)
        seed_users()
        print()

        # 2. カテゴリを投入
        print("[2/3] カテゴリの投入を開始します...")
        print("-" * 60)
        seed_categories()
        print()

        # 3. エクスペンスを投入
        print("[3/3] エクスペンスの投入を開始します...")
        print("-" * 60)
        seed_expenses()
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


if __name__ == "__main__":
    seed_all()

