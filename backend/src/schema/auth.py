from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class RegisterOptionsRequest(BaseModel):
    username: str


class RegisterOptionsResponse(BaseModel):
    options: dict[str, Any]


class RegisterVerifyRequest(BaseModel):
    username: str
    credential: dict[str, Any]


class RegisterVerifyResponse(BaseModel):
    message: str


class LoginOptionsRequest(BaseModel):
    username: str


class LoginOptionsResponse(BaseModel):
    options: dict[str, Any]


class LoginVerifyRequest(BaseModel):
    username: str
    credential: dict[str, Any]


class LoginVerifyResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    username: str
