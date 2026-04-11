# Authentication

## Overview

Passwordless authentication. User authentication via WebAuthn/passkeys, session management via JWT.

## Authentication Flow

### 1. Passkey Registration

```
Client                        Server
  │                              │
  ├─ POST /auth/register/options ─→│ (send username)
  │                              ├─ Generate WebAuthn options
  │                              ├─ Store challenge (TTL 5 min)
  │←─────── options ─────────────┤
  ├─ Generate passkey (browser)    │
  ├─ POST /auth/register/verify ──→│ (send credential)
  │                              ├─ Verify challenge
  │                              ├─ Create User + Credential
  │←─────── { message } ─────────┤
```

### 2. Passkey Authentication

```
Client                        Server
  │                              │
  ├─ POST /auth/signin/options ──→│ (send username)
  │                              ├─ Generate WebAuthn options
  │                              ├─ Store challenge (TTL 5 min)
  │←─────── options ─────────────┤
  ├─ Authenticate passkey (browser)│
  ├─ POST /auth/signin/verify ───→│ (send credential)
  │                              ├─ Verify challenge
  │                              ├─ Update sign_count
  │                              ├─ Generate JWT
  │←─── { access_token } ────────┤
```

### 3. Authenticated Request

```
Client                        Server
  │                              │
  ├─ GET /expenses ──────────────→│ (Authorization: Bearer <JWT>)
  │                              ├─ Verify JWT
  │                              ├─ Get user
  │                              ├─ Generate new JWT
  │←─── data + X-New-Token ──────┤
  ├─ Update token (localStorage)   │
```

## JWT Specification

| Item | Value |
|------|-------|
| Algorithm | HS256 |
| Expiration | 15 minutes |
| Payload | `{ sub: user_uuid, exp }` |
| Refresh | Auto-reissued via `X-New-Token` header on every request |

## Security

- **SecurityHeadersMiddleware**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
- **CORS**: Only frontend origin allowed
- **JWT Secret Key**: Must be 32+ characters in production
- **Challenge TTL**: Auto-expires after 5 minutes
- **On 401**: Client automatically redirects to `/signin`
