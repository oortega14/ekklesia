# Ekklesia Auth Integration — Design Spec
**Date:** 2026-04-11
**Status:** Approved
**Scope:** Connect ekklesia-client (Next.js) to ekklesia-api (Rails) — auth layer only

---

## 1. Overview

Replace the simulated login in the Next.js frontend with real JWT authentication against the Rails API. After this phase, every page load, login, logout, and protected route check runs against the real backend. Mock data on individual pages is addressed in a subsequent phase.

**Projects:**
- API: `/Users/oscarortega/work/ekklesia/ekklesia-api`
- Client: `/Users/oscarortega/work/ekklesia/ekklesia-client`

---

## 2. Token Strategy

Two-token pattern with JWTs only (no extra DB table):

| Token | Lifetime | Storage | Contents |
|-------|----------|---------|----------|
| `access_token` | 30 min | In-memory (React state) | `sub, role, ministry_id, church_id, iat, exp` |
| `refresh_token` | 7 days | `localStorage` (`ekklesia_refresh`) | `sub, type: "refresh", iat, exp` |

Both tokens are signed with the same per-user HMAC secret: `secret_key_base + account.jwt_secret`.

Rotating `jwt_secret` on logout invalidates both tokens simultaneously — no separate revocation needed.

---

## 3. API Changes

### 3.1 Login response — two tokens

`POST /api/v1/auth/login` currently returns `{ "token": "..." }`.

Modified to return:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

**Implementation:** Override `after_login` in `rodauth_main.rb` to generate a refresh JWT and store it in `@refresh_token`. Override `json_response_body` to merge it into the response hash.

Signup (`POST /api/v1/auth/signup`) follows the same flow — Rodauth calls `after_login` internally after account creation, so it gets both tokens automatically.

### 3.2 New endpoint — `POST /api/v1/auth/refresh`

**Request:**
```json
{ "refresh_token": "eyJ..." }
```

**Response (200):**
```json
{ "access_token": "eyJ..." }
```

**Response (401):**
```json
{ "error": "..." }
```

**Logic:**
1. Decode without verification → extract `sub` (account_id)
2. Reject if `type` claim is not `"refresh"`
3. Load account, build per-user HMAC secret
4. Verify JWT signature and expiry
5. Load associated User
6. Issue new access token (30 min) with `role`, `ministry_id`, `church_id`

This endpoint is **excluded from `authenticate!`** via `skip_before_action`.

**File:** `app/controllers/api/v1/refresh_controller.rb`
**Route:** `post 'auth/refresh', to: 'auth/refresh#create'` (or added to auth_controller)

### 3.3 ApplicationController — reject refresh tokens

In `authenticate!`, after verifying the JWT, check:
```ruby
raise JWT::DecodeError, 'Invalid token type' if payload['type'] == 'refresh'
```

This prevents a refresh token from being used as an access token.

### 3.4 Access token expiry — 30 minutes

In `rodauth_main.rb`, change the `exp` claim in `jwt_payload` from 24h to 30 minutes.

---

## 4. Frontend Architecture

### 4.1 File map

**New files:**
```
lib/
  api/
    client.ts          — axios instance, base URL, interceptors
  auth/
    context.tsx        — AuthContext, AuthProvider, useAuth hook
    guard.tsx          — ProtectedRoute component
.env.local             — NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Modified files:**
```
app/
  layout.tsx                   — wrap with <AuthProvider>
  page.tsx                     — real login call, store tokens
  superadmin/layout.tsx        — <ProtectedRoute role="superadmin">
  lead-pastor/layout.tsx       — <ProtectedRoute role="lead_pastor">
  pastor/layout.tsx            — <ProtectedRoute role="pastor">
  assistant/layout.tsx         — <ProtectedRoute role="assistant">
components/dashboard/
  header.tsx                   — display real user name/role from useAuth()
```

### 4.2 AuthContext

```ts
interface AuthUser {
  id: number
  email: string
  role: 'superadmin' | 'lead_pastor' | 'pastor' | 'assistant'
  ministry_id: number | null
  church_id: number | null
  first_name: string
  last_name: string
  full_name: string
}

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}
```

**On mount (`useEffect`):**
1. Check `localStorage.getItem('ekklesia_refresh')`
2. If found → call `POST /api/v1/auth/refresh`
3. On success → set `accessToken` + decode JWT to populate `user`
4. On failure → clear localStorage, `user` stays `null`
5. Set `isLoading = false` when done

**`login(email, password)`:**
1. `POST /api/v1/auth/login`
2. Store `refresh_token` in localStorage
3. Set `accessToken` in state
4. Call `GET /api/v1/auth/me` to get full user object
5. Set `user` in state

**`logout()`:**
1. `DELETE /api/v1/auth/logout` (best-effort, don't block on failure)
2. `localStorage.removeItem('ekklesia_refresh')`
3. Set `user = null`, `accessToken = null`
4. `router.push('/')`

### 4.3 Axios client (`lib/api/client.ts`)

```ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
})
```

**Request interceptor:** Reads `accessToken` from a module-level ref (updated by AuthContext) and injects the `Authorization: Bearer` header.

**Response interceptor (401 handling):**
1. On 401: check if it's already a retry (avoid infinite loop)
2. Get refresh token from localStorage
3. If no refresh token → clear state, redirect to `/`
4. `POST /api/v1/auth/refresh`
5. On success → update access token ref → retry original request
6. On failure → clear state, redirect to `/`
7. Queue concurrent 401s while refreshing (resolve/reject all after refresh completes)

### 4.4 ProtectedRoute (`lib/auth/guard.tsx`)

```tsx
<ProtectedRoute role="lead_pastor">
  {children}
</ProtectedRoute>
```

Behavior:
- `isLoading === true` → render full-page spinner
- `user === null` → `router.replace('/')` (not `/login` — the root is the login page)
- `user.role !== role` → `router.replace(`/${userRolePath}`)` (redirect to correct dashboard)
- Otherwise → render children

### 4.5 Header update

`components/dashboard/header.tsx` currently has hardcoded user names per role. Replace with `useAuth().user.full_name` and `useAuth().user.role`.

---

## 5. Token Lifecycle Diagrams

### Login
```
User submits form
  → POST /api/v1/auth/login
  ← { access_token, refresh_token }
  → localStorage.setItem('ekklesia_refresh', refresh_token)
  → state.accessToken = access_token
  → GET /api/v1/auth/me  (with access_token)
  ← { user: { id, role, ministry_id, ... } }
  → state.user = user
  → router.push(`/${rolePath}`)
```

### Page reload
```
App mounts → isLoading = true
  → localStorage.getItem('ekklesia_refresh')
  → exists → POST /api/v1/auth/refresh
    ← { access_token }
    → state.accessToken = access_token
    → GET /api/v1/auth/me
    → state.user = user
    → isLoading = false → render dashboard
  → missing → isLoading = false → ProtectedRoute redirects to /
```

### 401 during normal use
```
axios request → 401 response
  → interceptor: queue pending requests
  → POST /api/v1/auth/refresh
    ← success → update accessToken → flush queue (retry all)
    ← failure  → logout() → redirect to /
```

### Logout
```
User clicks logout
  → DELETE /api/v1/auth/logout  (rotates jwt_secret → both tokens invalid)
  → localStorage.removeItem('ekklesia_refresh')
  → state.user = null, state.accessToken = null
  → router.push('/')
```

---

## 6. Error Handling

| Scenario | Behavior |
|----------|----------|
| Wrong credentials | API returns 401, login form shows error message |
| Refresh token expired | Refresh fails → logout → redirect to `/` |
| Network error on refresh | Treat as refresh failure → logout |
| API down on page load | `isLoading` stays true briefly, then fallback to login |
| Refresh token missing (private mode) | No refresh attempt → redirect to login |

---

## 7. Environment

```bash
# .env.local (ekklesia-client)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

The Rails API runs on port 3001 (`rails server -p 3001`) to avoid conflict with Next.js on 3000.

---

## 8. Out of Scope (this phase)

- Replacing mock data on individual dashboard pages (next phase)
- "Remember me" checkbox behavior (currently ignored — always stores refresh token)
- Token rotation on refresh (refresh token stays the same across refreshes)
- Multi-device logout
