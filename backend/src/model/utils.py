import uuid6


def generate_uuid_string() -> str:
    """UUID v7をハイフンなしの32文字の文字列として生成"""
    return uuid6.uuid7().hex

