"""Category テーブルに seed データを投入するスクリプト"""
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.orm import Session

# プロジェクトのルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent))

# .envファイルから環境変数を読み込む(インポートの前に実行)
load_dotenv()

from src.model import Category  # noqa: E402
from src.repository.database import SessionLocal  # noqa: E402


def seed_categories() -> None:
    """Category テーブルに seed データを投入"""
    db: Session = SessionLocal()
    try:
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

        # カテゴリを作成
        categories = [Category(name=name) for name in category_names]

        # データを投入
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
