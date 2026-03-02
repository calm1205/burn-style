from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class RegisterOptionsRequest(BaseModel):
    name: str


class RegisterOptionsResponse(BaseModel):
    options: dict[str, Any]


class RegisterVerifyRequest(BaseModel):
    name: str
    credential: dict[str, Any]


class RegisterVerifyResponse(BaseModel):
    message: str


class SignInOptionsRequest(BaseModel):
    name: str


class SignInOptionsResponse(BaseModel):
    options: dict[str, Any]


class SignInVerifyRequest(BaseModel):
    name: str
    credential: dict[str, Any]


class SignInVerifyResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
