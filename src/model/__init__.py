import uuid6

from src.model.user import User
from src.model.transaction import Transaction
from src.model.category import Category

def generate_uuid_string() -> str:
    """UUID v7をハイフンなしの32文字の文字列として生成"""
    return uuid6.uuid7().hex

__all__ = ["User", "Transaction", "Category", "generate_uuid_string"]
