from __future__ import annotations

from datetime import UTC, datetime, timedelta, timezone
from typing import Annotated

from pydantic.functional_serializers import PlainSerializer

JST = timezone(timedelta(hours=9))


def _to_jst(v: datetime) -> datetime:
    """naive datetimeをUTCとみなしJSTに変換"""
    return v.replace(tzinfo=UTC).astimezone(JST)


JstDatetime = Annotated[datetime, PlainSerializer(_to_jst)]
