from __future__ import annotations

from dataclasses import dataclass
from typing import Any, cast

from src.domain.expense import VibeNecessity, VibePlanning, VibeSocial


@dataclass(frozen=True)
class VibeFields:
    social: VibeSocial | None
    planning: VibePlanning | None
    necessity: VibeNecessity | None


def read_vibe_fields(entity: object) -> VibeFields:
    """DB カラム3本をそのまま VibeFields として返す。"""
    return VibeFields(
        social=cast(VibeSocial | None, getattr(entity, "vibe_social", None)),
        planning=cast(VibePlanning | None, getattr(entity, "vibe_planning", None)),
        necessity=cast(VibeNecessity | None, getattr(entity, "vibe_necessity", None)),
    )


def write_vibe_fields(entity: Any, fields: VibeFields | None) -> None:
    """VibeFields を DB カラム3本へ書き込む。None で全クリア。"""
    if fields is None:
        entity.vibe_social = None
        entity.vibe_planning = None
        entity.vibe_necessity = None
        return
    entity.vibe_social = fields.social
    entity.vibe_planning = fields.planning
    entity.vibe_necessity = fields.necessity
