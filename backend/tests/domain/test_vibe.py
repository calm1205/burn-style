from types import SimpleNamespace

from src.domain.expense import VibeNecessity, VibePlanning, VibeSocial
from src.domain.vibe import VibeFields, read_vibe_fields, write_vibe_fields


def test_read_vibe_fields_returns_db_values() -> None:
    entity = SimpleNamespace(
        vibe_social=VibeSocial.SOLO,
        vibe_planning=VibePlanning.ROUTINE,
        vibe_necessity=VibeNecessity.NEEDED,
    )
    assert read_vibe_fields(entity) == VibeFields(
        social=VibeSocial.SOLO,
        planning=VibePlanning.ROUTINE,
        necessity=VibeNecessity.NEEDED,
    )


def test_read_vibe_fields_preserves_partial_null() -> None:
    entity = SimpleNamespace(
        vibe_social=VibeSocial.SOLO,
        vibe_planning=None,
        vibe_necessity=VibeNecessity.NEEDED,
    )
    assert read_vibe_fields(entity) == VibeFields(
        social=VibeSocial.SOLO,
        planning=None,
        necessity=VibeNecessity.NEEDED,
    )


def test_write_vibe_fields_sets_all_columns() -> None:
    entity = SimpleNamespace(
        vibe_social=None,
        vibe_planning=None,
        vibe_necessity=None,
    )
    write_vibe_fields(
        entity,
        VibeFields(
            social=VibeSocial.WITH_SOMEONE,
            planning=VibePlanning.SPONTANEOUS,
            necessity=VibeNecessity.WANTED,
        ),
    )
    assert entity.vibe_social == VibeSocial.WITH_SOMEONE
    assert entity.vibe_planning == VibePlanning.SPONTANEOUS
    assert entity.vibe_necessity == VibeNecessity.WANTED


def test_write_vibe_fields_none_clears_all_columns() -> None:
    entity = SimpleNamespace(
        vibe_social=VibeSocial.SOLO,
        vibe_planning=VibePlanning.ROUTINE,
        vibe_necessity=VibeNecessity.NEEDED,
    )
    write_vibe_fields(entity, None)
    assert entity.vibe_social is None
    assert entity.vibe_planning is None
    assert entity.vibe_necessity is None
