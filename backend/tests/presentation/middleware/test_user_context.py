from __future__ import annotations

import pytest
from starlette.requests import Request
from starlette.responses import Response

from src.logger import user_uuid_var
from src.presentation.middleware.user_context import UserContextMiddleware, _user_uuid_from_authorization
from src.service.jwt_service import create_access_token


def test_user_uuid_from_authorization_returns_none_for_missing_header() -> None:
    assert _user_uuid_from_authorization("") is None


def test_user_uuid_from_authorization_returns_none_for_invalid_token() -> None:
    assert _user_uuid_from_authorization("Bearer invalid") is None


def test_user_uuid_from_authorization_returns_sub_from_valid_token() -> None:
    user_uuid = "testuser0000000000000000000000"
    token = create_access_token(user_uuid)

    assert _user_uuid_from_authorization(f"Bearer {token}") == user_uuid


@pytest.mark.anyio
async def test_user_context_middleware_sets_and_resets_context_var() -> None:
    user_uuid = "testuser0000000000000000000000"
    token = create_access_token(user_uuid)
    middleware = UserContextMiddleware(app=None)  # type: ignore[arg-type]

    async def call_next(_request: Request) -> Response:
        assert user_uuid_var.get() == user_uuid
        return Response(status_code=204)

    scope = {
        "type": "http",
        "headers": [(b"authorization", f"Bearer {token}".encode())],
        "method": "GET",
        "path": "/",
        "query_string": b"",
        "client": ("testclient", 50000),
        "server": ("testserver", 80),
        "scheme": "http",
        "root_path": "",
        "http_version": "1.1",
    }
    request = Request(scope)

    assert user_uuid_var.get() is None
    response = await middleware.dispatch(request, call_next)
    assert response.status_code == 204
    assert user_uuid_var.get() is None
