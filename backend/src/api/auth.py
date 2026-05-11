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
from webauthn.helpers.structs import AuthenticatorTransport, PublicKeyCredentialDescriptor

from src.config import get_frontend_origin, get_webauthn_rp_id, get_webauthn_rp_name
from src.repository.database import get_db
from src.repository.user_repository import create_user, get_user_by_name
from src.repository.webauthn_challenge_repository import save_challenge, take_challenge
from src.repository.webauthn_repository import (
    create_credential,
    get_credential_by_credential_id,
    get_credentials_by_user_uuid,
    update_sign_count,
)
from src.schema.auth import (
    RegisterOptionsRequest,
    RegisterOptionsResponse,
    RegisterVerifyRequest,
    RegisterVerifyResponse,
    SignInOptionsRequest,
    SignInOptionsResponse,
    SignInVerifyRequest,
    SignInVerifyResponse,
)
from src.service.jwt_service import create_access_token

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register/options")
def register_options(
    body: RegisterOptionsRequest,
    db: Annotated[Session, Depends(get_db)],
) -> RegisterOptionsResponse:
    """登録オプションを生成。"""
    existing = get_user_by_name(db, body.name)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed")

    options = generate_registration_options(
        rp_id=get_webauthn_rp_id(),
        rp_name=get_webauthn_rp_name(),
        user_name=body.name,
    )

    save_challenge(db, body.name, options.challenge)

    options_json: dict[str, Any] = json.loads(options_to_json(options))
    return RegisterOptionsResponse(options=options_json)


@auth_router.post("/register/verify")
def register_verify(
    body: RegisterVerifyRequest,
    db: Annotated[Session, Depends(get_db)],
) -> RegisterVerifyResponse:
    """登録を検証しユーザーと資格情報を作成。"""
    challenge = take_challenge(db, body.name)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge not found or expired")

    try:
        verification = verify_registration_response(
            credential=body.credential,
            expected_challenge=challenge,
            expected_rp_id=get_webauthn_rp_id(),
            expected_origin=get_frontend_origin(),
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed") from None

    user = create_user(db, body.name)

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


@auth_router.post("/signin/options")
def sign_in_options(
    body: SignInOptionsRequest,
    db: Annotated[Session, Depends(get_db)],
) -> SignInOptionsResponse:
    """認証オプションを生成。"""
    user = get_user_by_name(db, body.name)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authentication failed")

    credentials = get_credentials_by_user_uuid(db, user.uuid)  # type: ignore[arg-type]

    allow_credentials = [
        PublicKeyCredentialDescriptor(
            id=cred.credential_id,  # type: ignore[arg-type]
            transports=[AuthenticatorTransport(t) for t in json.loads(cred.transports)]  # type: ignore[arg-type]
            if cred.transports
            else None,
        )
        for cred in credentials
    ]

    options = generate_authentication_options(
        rp_id=get_webauthn_rp_id(),
        allow_credentials=allow_credentials,
    )

    save_challenge(db, body.name, options.challenge)

    options_json: dict[str, Any] = json.loads(options_to_json(options))
    return SignInOptionsResponse(options=options_json)


@auth_router.post("/signin/verify")
def sign_in_verify(
    body: SignInVerifyRequest,
    db: Annotated[Session, Depends(get_db)],
) -> SignInVerifyResponse:
    """認証を検証しJWTを返却。"""
    challenge = take_challenge(db, body.name)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge not found or expired")

    user = get_user_by_name(db, body.name)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authentication failed")

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
            expected_origin=get_frontend_origin(),
            credential_public_key=stored_credential.credential_public_key,  # type: ignore[arg-type]
            credential_current_sign_count=stored_credential.sign_count,  # type: ignore[arg-type]
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authentication failed") from None

    update_sign_count(db, stored_credential, verification.new_sign_count)

    access_token = create_access_token(user.uuid)  # type: ignore[arg-type]

    return SignInVerifyResponse(access_token=access_token, token_type="bearer")  # noqa: S106
