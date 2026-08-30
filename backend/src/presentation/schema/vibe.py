from __future__ import annotations

from pydantic import BaseModel

from src.domain.expense import VibeNecessity, VibePlanning, VibeSocial
from src.domain.vibe import VibeFields


class Vibe(BaseModel):
    social: VibeSocial | None
    planning: VibePlanning | None
    necessity: VibeNecessity | None


NULL_VIBE = Vibe(social=None, planning=None, necessity=None)

DEFAULT_VIBE = Vibe(
    social=VibeSocial.SOLO,
    planning=VibePlanning.ROUTINE,
    necessity=VibeNecessity.NEEDED,
)


def vibe_fields_to_schema(fields: VibeFields) -> Vibe:
    return Vibe(social=fields.social, planning=fields.planning, necessity=fields.necessity)


def vibe_from_schema(vibe: Vibe | None) -> VibeFields | None:
    if vibe is None:
        return None
    return VibeFields(social=vibe.social, planning=vibe.planning, necessity=vibe.necessity)
