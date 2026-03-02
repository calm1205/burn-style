from __future__ import annotations

import os
from collections.abc import Generator
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# .envファイルから環境変数を読み込む
load_dotenv()


def get_database_url() -> str:
    """環境変数からDATABASE_URLを取得し、ホスト名を適切に変換する"""
    # Vercel production環境ではPOSTGRES_URLを使用
    vercel_env = os.getenv("VERCEL_ENV")
    if vercel_env == "production":
        postgres_url = os.getenv("POSTGRES_URL")
        if postgres_url is None:
            raise ValueError(
                "POSTGRES_URL environment variable is not set. "
                "Please set it in Vercel environment variables.",
            )
        return postgres_url

    # ローカル環境ではDATABASE_URLを使用
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
        database_url = database_url.replace("@db/", "@localhost/").replace("@db:", "@localhost:")

    return database_url


class Base(DeclarativeBase):
    pass


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """エンジンを遅延生成"""
    return create_engine(get_database_url())


@lru_cache(maxsize=1)
def get_session_local() -> sessionmaker[Session]:
    """セッションファクトリを遅延生成"""
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


def get_db() -> Generator[Session]:
    """データベースセッションを取得する依存性注入用の関数"""
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()
