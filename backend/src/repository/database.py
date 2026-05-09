from __future__ import annotations

import os
from collections.abc import Generator
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# Load environment variables from .env file
load_dotenv()


def get_database_url() -> str:
    """環境変数からDATABASE_URLを取得しホスト名を解決。"""
    # Use POSTGRES_URL in Vercel production environment
    vercel_env = os.getenv("VERCEL_ENV")
    if vercel_env == "production":
        postgres_url = os.getenv("POSTGRES_URL")
        if postgres_url is None:
            raise ValueError(
                "POSTGRES_URL environment variable is not set. "
                "Please set it in Vercel environment variables.",
            )
        return postgres_url

    # Use DATABASE_URL in local environment
    database_url = os.getenv("DATABASE_URL")
    if database_url is None:
        raise ValueError(
            "DATABASE_URL environment variable is not set. "
            "Please set it in your .env file or environment.",
        )

    # Detect if running inside a Docker container
    # True if /app directory or /.dockerenv file exists
    is_docker = Path("/.dockerenv").exists() or Path("/app").exists()

    # Replace hostname with localhost only when running on the host machine
    # Use "db" inside Docker containers, "localhost" on the host
    if not is_docker and "://" in database_url and ("@db/" in database_url or "@db:" in database_url):
        database_url = database_url.replace("@db/", "@localhost/").replace("@db:", "@localhost:")

    return database_url


class Base(DeclarativeBase):
    pass


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """DBエンジンを遅延生成。"""
    return create_engine(get_database_url())


@lru_cache(maxsize=1)
def get_session_local() -> sessionmaker[Session]:
    """セッションファクトリを遅延生成。"""
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


def get_db() -> Generator[Session]:
    """DBセッションをyieldするDI関数。"""
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()
