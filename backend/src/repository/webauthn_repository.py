from __future__ import annotations

from sqlalchemy.orm import Session

from src.model.webauthn_credential import WebAuthnCredential


def get_credentials_by_user_uuid(db: Session, user_uuid: str) -> list[WebAuthnCredential]:
    """ユーザーUUIDで全WebAuthn資格情報を取得。"""
    return db.query(WebAuthnCredential).filter(WebAuthnCredential.user_uuid == user_uuid).all()


def get_credential_by_credential_id(db: Session, credential_id: bytes) -> WebAuthnCredential | None:
    """credential IDから資格情報を取得。"""
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
    """WebAuthn資格情報を新規作成。"""
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
    """資格情報のsign_countを更新。"""
    credential.sign_count = new_sign_count  # type: ignore[assignment]
    db.commit()
