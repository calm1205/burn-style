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


class LoginOptionsRequest(BaseModel):
    name: str


class LoginOptionsResponse(BaseModel):
    options: dict[str, Any]


class LoginVerifyRequest(BaseModel):
    name: str
    credential: dict[str, Any]


class LoginVerifyResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
