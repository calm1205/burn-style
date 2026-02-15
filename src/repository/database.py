import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# .envファイルから環境変数を読み込む
load_dotenv()


def get_database_url() -> str:
    """環境変数からDATABASE_URLを取得し、ホスト名を適切に変換する"""
    database_url = os.getenv("DATABASE_URL")
    if database_url is None:
        raise ValueError(
            "DATABASE_URL environment variable is not set. "
            "Please set it in your .env file or environment.",
        )

    # Dockerコンテナ内で実行されているかどうかを判断
    # /appディレクトリが存在し、かつ/.dockerenvファイルが存在する場合はDockerコンテナ内
    is_docker = Path("/.dockerenv").exists() or Path("/app").exists()

    # ホストマシンから実行する場合のみ、ホスト名をlocalhostに変更
    # Dockerコンテナ内では"db"、ホストマシンからは"localhost"を使用
    if not is_docker and "://" in database_url and ("@db/" in database_url or "@db:" in database_url):
        # ホストマシンから実行する場合、dbをlocalhostに置き換え
        database_url = database_url.replace("@db/", "@localhost/").replace("@db:", "@localhost:")

    return database_url


DATABASE_URL = get_database_url()

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """データベースセッションを取得する依存性注入用の関数"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
