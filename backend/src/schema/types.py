from __future__ import annotations

from datetime import UTC, datetime, timedelta, timezone
from typing import Annotated

from pydantic import AfterValidator
from pydantic.functional_serializers import PlainSerializer

JST = timezone(timedelta(hours=9))


def _to_jst(v: datetime) -> datetime:
    """Convert naive datetime (assumed UTC) to JST."""
    return v.replace(tzinfo=UTC).astimezone(JST)


def _jst_to_utc(v: datetime) -> datetime:
    """Convert JST input to naive UTC (naive->JST->UTC->naive)."""
    if v.tzinfo is None:
        v = v.replace(tzinfo=JST)
    return v.astimezone(UTC).replace(tzinfo=None)


JstDatetime = Annotated[datetime, PlainSerializer(_to_jst)]
JstInputDatetime = Annotated[datetime, AfterValidator(_jst_to_utc)]
