from __future__ import annotations

import json
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    options_to_json,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers.structs import PublicKeyCredentialDescriptor

from src.config import get_webauthn_origin, get_webauthn_rp_id, get_webauthn_rp_name
from src.repository.database import get_db
from src.repository.user_repository import create_user, get_user_by_username
from src.repository.webauthn_repository import (
    create_credential,
    get_credential_by_credential_id,
    get_credentials_by_user_uuid,
    update_sign_count,
)
from src.schema.auth import (
    LoginOptionsRequest,
    LoginOptionsResponse,
    LoginVerifyRequest,
    LoginVerifyResponse,
    RegisterOptionsRequest,
    RegisterOptionsResponse,
    RegisterVerifyRequest,
    RegisterVerifyResponse,
)
from src.service.challenge_store import challenge_store
from src.service.jwt_service import create_access_token

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register/options")
def register_options(
    body: RegisterOptionsRequest,
    db: Annotated[Session, Depends(get_db)],
) -> RegisterOptionsResponse:
    """登録オプション生成"""
    existing = get_user_by_username(db, body.username)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")

    options = generate_registration_options(
        rp_id=get_webauthn_rp_id(),
        rp_name=get_webauthn_rp_name(),
        user_name=body.username,
    )

    challenge_store.save(body.username, options.challenge)

    options_json: dict[str, Any] = json.loads(options_to_json(options))
    return RegisterOptionsResponse(options=options_json)


@auth_router.post("/register/verify")
def register_verify(
    body: RegisterVerifyRequest,
    db: Annotated[Session, Depends(get_db)],
) -> RegisterVerifyResponse:
    """登録検証 → ユーザー+クレデンシャル作成"""
    challenge = challenge_store.get(body.username)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge not found or expired")

    try:
        verification = verify_registration_response(
            credential=body.credential,
            expected_challenge=challenge,
            expected_rp_id=get_webauthn_rp_id(),
            expected_origin=get_webauthn_origin(),
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e

    user = create_user(db, body.username)

    transports_json: str | None = None
    if body.credential.get("response", {}).get("transports"):
        transports_json = json.dumps(body.credential["response"]["transports"])

    create_credential(
        db,
        user_uuid=user.uuid,  # type: ignore[arg-type]
        credential_id=verification.credential_id,
        credential_public_key=verification.credential_public_key,
        sign_count=verification.sign_count,
        transports=transports_json,
    )

    return RegisterVerifyResponse(message="Registration successful")


@auth_router.post("/login/options")
def login_options(
    body: LoginOptionsRequest,
    db: Annotated[Session, Depends(get_db)],
) -> LoginOptionsResponse:
    """認証オプション生成"""
    user = get_user_by_username(db, body.username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    credentials = get_credentials_by_user_uuid(db, user.uuid)  # type: ignore[arg-type]

    allow_credentials = [
        PublicKeyCredentialDescriptor(
            id=cred.credential_id,  # type: ignore[arg-type]
            transports=json.loads(cred.transports) if cred.transports else None,  # type: ignore[arg-type]
        )
        for cred in credentials
    ]

    options = generate_authentication_options(
        rp_id=get_webauthn_rp_id(),
        allow_credentials=allow_credentials,
    )

    challenge_store.save(body.username, options.challenge)

    options_json: dict[str, Any] = json.loads(options_to_json(options))
    return LoginOptionsResponse(options=options_json)


@auth_router.post("/login/verify")
def login_verify(
    body: LoginVerifyRequest,
    db: Annotated[Session, Depends(get_db)],
) -> LoginVerifyResponse:
    """認証検証 → JWTトークン返却"""
    challenge = challenge_store.get(body.username)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge not found or expired")

    user = get_user_by_username(db, body.username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    raw_id = body.credential.get("rawId", "")
    from webauthn import base64url_to_bytes  # noqa: PLC0415

    credential_id_bytes = base64url_to_bytes(raw_id)

    stored_credential = get_credential_by_credential_id(db, credential_id_bytes)
    if stored_credential is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Credential not found")

    try:
        verification = verify_authentication_response(
            credential=body.credential,
            expected_challenge=challenge,
            expected_rp_id=get_webauthn_rp_id(),
            expected_origin=get_webauthn_origin(),
            credential_public_key=stored_credential.credential_public_key,  # type: ignore[arg-type]
            credential_current_sign_count=stored_credential.sign_count,  # type: ignore[arg-type]
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e

    update_sign_count(db, stored_credential, verification.new_sign_count)

    access_token = create_access_token(user.uuid)  # type: ignore[arg-type]

    return LoginVerifyResponse(access_token=access_token, token_type="bearer")  # noqa: S106
