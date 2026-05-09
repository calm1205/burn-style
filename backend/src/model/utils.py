import uuid6


def generate_uuid_string() -> str:
    """UUID v7を32文字のhex文字列で生成 (ハイフンなし)。"""
    return uuid6.uuid7().hex

