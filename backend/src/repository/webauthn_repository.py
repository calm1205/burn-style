from __future__ import annotations

from sqlalchemy.orm import Session

from src.model.webauthn_credential import WebAuthnCredential


def get_credentials_by_user_uuid(db: Session, user_uuid: str) -> list[WebAuthnCredential]:
    """Get all WebAuthn credentials by user UUID."""
    return db.query(WebAuthnCredential).filter(WebAuthnCredential.user_uuid == user_uuid).all()


def get_credential_by_credential_id(db: Session, credential_id: bytes) -> WebAuthnCredential | None:
    """Get a WebAuthn credential by credential ID."""
    return db.query(WebAuthnCredential).filter(WebAuthnCredential.credential_id == credential_id).first()


def create_credential(  # noqa: PLR0913
    db: Session,
    *,
    user_uuid: str,
    credential_id: bytes,
    credential_public_key: bytes,
    sign_count: int,
    transports: str | None,
) -> WebAuthnCredential:
    """Create a new WebAuthn credential."""
    credential = WebAuthnCredential(
        user_uuid=user_uuid,
        credential_id=credential_id,
        credential_public_key=credential_public_key,
        sign_count=sign_count,
        transports=transports,
    )
    db.add(credential)
    db.commit()
    db.refresh(credential)
    return credential


def update_sign_count(db: Session, credential: WebAuthnCredential, new_sign_count: int) -> None:
    """Update the sign count of a credential."""
    credential.sign_count = new_sign_count  # type: ignore[assignment]
    db.commit()
