import uuid6


def generate_uuid_string() -> str:
    """Generate a UUID v7 as a 32-character hex string without hyphens."""
    return uuid6.uuid7().hex

