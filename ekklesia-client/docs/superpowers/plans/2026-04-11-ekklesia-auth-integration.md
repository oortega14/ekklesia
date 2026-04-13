# Ekklesia Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the Next.js frontend to the Rails API with real JWT authentication — access token in memory, refresh token in localStorage, axios interceptor for automatic refresh.

**Architecture:** Rails issues two JWTs on login (access: 30 min, refresh: 7 days). The Next.js `AuthContext` hydrates from the refresh token on page load, holds the access token in state, and wires axios so every request includes the bearer header. A 401 response triggers an automatic refresh cycle; failed refreshes redirect to login.

**Tech Stack:** Rails 7 (rodauth-rails), Next.js 15 (App Router), TypeScript, axios, JWT

---

## File Map

### API (`/Users/oscarortega/work/ekklesia/ekklesia-api`)

| Action | File | What changes |
|--------|------|-------------|
| Modify | `app/misc/rodauth_main.rb` | `exp` → 30 min; `after_login` generates refresh JWT; `json_response_body` renames `token`→`access_token` and adds `refresh_token` |
| Create | `app/controllers/api/v1/refresh_controller.rb` | `POST /api/v1/auth/refresh` — verifies refresh JWT, issues new access token |
| Modify | `app/controllers/application_controller.rb` | Rejects tokens with `type: "refresh"` claim |
| Modify | `config/routes.rb` | `post 'auth/refresh'` under `api/v1` |
| Create | `spec/requests/api/v1/refresh_spec.rb` | Integration tests for refresh endpoint |

### Frontend (`/Users/oscarortega/work/ekklesia/ekklesia-client`)

| Action | File | What changes |
|--------|------|-------------|
| Create | `.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:3001` |
| Create | `lib/api/client.ts` | axios instance, module-level token ref, request/response interceptors |
| Create | `lib/auth/context.tsx` | `AuthContext`, `AuthProvider`, `useAuth` hook |
| Create | `lib/auth/guard.tsx` | `ProtectedRoute` component |
| Modify | `app/layout.tsx` | Wrap with `<AuthProvider>` |
| Create | `app/superadmin/layout.tsx` | `<ProtectedRoute role="superadmin">` |
| Create | `app/lead-pastor/layout.tsx` | `<ProtectedRoute role="lead_pastor">` |
| Create | `app/pastor/layout.tsx` | `<ProtectedRoute role="pastor">` |
| Create | `app/assistant/layout.tsx` | `<ProtectedRoute role="assistant">` |
| Modify | `app/page.tsx` | Replace mock login with `useAuth().login()` |
| Modify | `components/dashboard/header.tsx` | Make `userName`/`userRole` optional; read from `useAuth()`; wire real logout |

---

## Task 1: Rodauth — two-token login response

**Files:**
- Modify: `app/misc/rodauth_main.rb`

- [ ] **Step 1: Read the current rodauth_main.rb**

```bash
cat /Users/oscarortega/work/ekklesia/ekklesia-api/app/misc/rodauth_main.rb
```

- [ ] **Step 2: Replace rodauth_main.rb**

Replace the entire file with:

```ruby
require "sequel/core"

class RodauthMain < Rodauth::Rails::Auth
  configure do
    enable :login, :logout, :create_account, :jwt

    # ── Routes (relative to /api/v1/auth) ────────────────────────────
    login_route          'login'
    logout_route         'logout'
    create_account_route 'signup'

    # ── General ───────────────────────────────────────────────────────
    db Sequel.postgres(extensions: :activerecord_connection, keep_reference: false)
    convert_token_id_to_integer? { Account.columns_hash["id"].type == :integer }

    # ── API-only ──────────────────────────────────────────────────────
    only_json? true

    # ── Account setup ─────────────────────────────────────────────────
    account_status_column :status
    account_password_hash_column :password_hash
    account_open_status_value 1

    login_param "email"

    password_minimum_length 8
    password_maximum_bytes 72

    rails_controller { RodauthController }

    # ── Per-user HMAC JWT secret ──────────────────────────────────────
    jwt_secret do
      account = db[:accounts].where(id: account_id).first
      "#{Rails.application.secret_key_base}-#{account[:jwt_secret]}"
    end

    # ── Access token claims (30 min) ──────────────────────────────────
    def jwt_payload
      payload = super
      payload['exp'] = 30.minutes.from_now.to_i
      user = ::User.find_by(account_id: account_id)
      if user
        payload['role']        = user.role
        payload['ministry_id'] = user.ministry_id
        payload['church_id']   = user.church_id
      end
      payload
    end

    # ── After login: generate refresh token ──────────────────────────
    after_login do
      account_row = db[:accounts].where(id: account_id).first
      secret = "#{Rails.application.secret_key_base}-#{account_row[:jwt_secret]}"
      refresh_payload = {
        'sub'  => account_id.to_s,
        'iat'  => Time.current.to_i,
        'exp'  => 7.days.from_now.to_i,
        'type' => 'refresh'
      }
      @_refresh_token = JWT.encode(refresh_payload, secret, 'HS256')
    end

    # ── Override JSON response: rename token→access_token, add refresh ─
    def json_response_body(hash)
      hash['access_token'] = hash.delete('token') if hash.key?('token')
      hash['refresh_token'] = @_refresh_token if @_refresh_token
      @_refresh_token = nil
      super(hash)
    end

    # ── Signup: initialize jwt_secret before account is created ──────
    before_create_account do
      account[:jwt_secret] = SecureRandom.hex(32)
    end

    # ── Signup: create Ministry + User atomically ─────────────────────
    after_create_account do
      ministry = ::Ministry.create!(
        name:    param('ministry_name'),
        country: param('country'),
        city:    param('city')
      )
      ::User.create!(
        account_id: account_id,
        ministry:   ministry,
        first_name: param('first_name'),
        last_name:  param('last_name'),
        phone:      param('phone'),
        role:       :lead_pastor
      )
    end

    # ── Logout: rotate jwt_secret → both tokens become invalid ────────
    after_logout do
      db[:accounts].where(id: account_id)
                   .update(jwt_secret: SecureRandom.hex(32))
    end

    login_redirect { '/' }
  end
end
```

- [ ] **Step 3: Verify the app still loads**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api && bundle exec rails routes 2>&1 | grep auth
```

Expected: no errors, auth routes still appear.

- [ ] **Step 4: Commit**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api
git add app/misc/rodauth_main.rb
git commit -m "feat: issue access_token (30min) and refresh_token (7d) on login"
```

---

## Task 2: API — Refresh endpoint

**Files:**
- Create: `app/controllers/api/v1/refresh_controller.rb`
- Modify: `config/routes.rb`
- Create: `spec/requests/api/v1/refresh_spec.rb`

- [ ] **Step 1: Write the failing spec**

Create `spec/requests/api/v1/refresh_spec.rb`:

```ruby
require 'rails_helper'

RSpec.describe 'Auth Refresh', type: :request do
  let(:ministry) { create(:ministry) }
  let(:user)     { create(:user, :lead_pastor, ministry: ministry) }

  def refresh_token_for(user)
    account = user.account
    secret  = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
    payload = {
      'sub'  => account.id.to_s,
      'iat'  => Time.current.to_i,
      'exp'  => 7.days.from_now.to_i,
      'type' => 'refresh'
    }
    JWT.encode(payload, secret, 'HS256')
  end

  describe 'POST /api/v1/auth/refresh' do
    context 'with valid refresh token' do
      it 'returns a new access token' do
        post '/api/v1/auth/refresh',
          params: { refresh_token: refresh_token_for(user) }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['access_token']).to be_present

        # Decoded access token should have correct claims
        decoded = JWT.decode(json['access_token'], nil, false)[0]
        expect(decoded['sub']).to eq(user.account.id.to_s)
        expect(decoded['role']).to eq('lead_pastor')
        expect(decoded['type']).not_to eq('refresh')
      end
    end

    context 'with an access token (wrong type)' do
      it 'returns 401' do
        post '/api/v1/auth/refresh',
          params: { refresh_token: auth_headers_for(user)['Authorization'].split(' ').last }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with missing token' do
      it 'returns 401' do
        post '/api/v1/auth/refresh'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with expired refresh token' do
      it 'returns 401' do
        account = user.account
        secret  = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
        expired = JWT.encode(
          { 'sub' => account.id.to_s, 'exp' => 1.day.ago.to_i, 'type' => 'refresh' },
          secret, 'HS256'
        )
        post '/api/v1/auth/refresh', params: { refresh_token: expired }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
```

- [ ] **Step 2: Run to confirm it fails**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api
bundle exec rspec spec/requests/api/v1/refresh_spec.rb --format documentation 2>&1
```

Expected: FAIL — route not found.

- [ ] **Step 3: Create the refresh controller**

Create `app/controllers/api/v1/refresh_controller.rb`:

```ruby
module Api
  module V1
    class RefreshController < ApplicationController
      skip_before_action :authenticate!
      skip_before_action :set_tenant

      def create
        refresh_token = params[:refresh_token]
        return render json: { error: 'Missing refresh token' }, status: :unauthorized unless refresh_token

        begin
          unverified = JWT.decode(refresh_token, nil, false)[0]
          raise JWT::DecodeError, 'Invalid token type' unless unverified['type'] == 'refresh'

          account_id = unverified['sub'].to_i
          account    = Account.find(account_id)
          secret     = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
          JWT.decode(refresh_token, secret, true, algorithm: 'HS256')

          user = User.find_by!(account: account)

          access_payload = {
            'sub'         => account.id.to_s,
            'iat'         => Time.current.to_i,
            'exp'         => 30.minutes.from_now.to_i,
            'role'        => user.role,
            'ministry_id' => user.ministry_id,
            'church_id'   => user.church_id
          }
          access_token = JWT.encode(access_payload, secret, 'HS256')

          render json: { access_token: access_token }
        rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound => e
          render json: { error: e.message }, status: :unauthorized
        end
      end
    end
  end
end
```

- [ ] **Step 4: Add the route**

Open `config/routes.rb` and add `post 'auth/refresh'` inside the `api/v1` namespace:

```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      get  'auth/me',      to: 'auth#me'
      post 'auth/refresh', to: 'refresh#create'

      # Resources
      resources :ministries
      resources :churches
      resources :users
      resources :services

      resources :service_requests, only: [:index, :show, :create] do
        member do
          patch :approve
          patch :reject
        end
      end

      resources :attendance_reports, only: [:index, :show, :create, :update]
      resources :contributions,      only: [:index, :show, :create, :update]
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
```

- [ ] **Step 5: Run the spec**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api
bundle exec rspec spec/requests/api/v1/refresh_spec.rb --format documentation 2>&1
```

Expected: 4 examples, 0 failures.

- [ ] **Step 6: Commit**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api
git add app/controllers/api/v1/refresh_controller.rb config/routes.rb spec/requests/api/v1/refresh_spec.rb
git commit -m "feat: add POST /api/v1/auth/refresh endpoint"
```

---

## Task 3: API — ApplicationController rejects refresh tokens

**Files:**
- Modify: `app/controllers/application_controller.rb`

- [ ] **Step 1: Add the type check to authenticate!**

Open `app/controllers/application_controller.rb`. Inside the `authenticate!` method, after the line `unverified_payload = JWT.decode(token, nil, false)[0]`, add:

```ruby
def authenticate!
  token = request.headers['Authorization']&.split(' ')&.last
  return render_unauthorized('Token missing') unless token

  begin
    unverified_payload = JWT.decode(token, nil, false)[0]

    # Reject refresh tokens — they cannot be used as access tokens
    if unverified_payload['type'] == 'refresh'
      return render_unauthorized('Invalid token type')
    end

    account_id = unverified_payload['sub'].to_i
    account = Account.find(account_id)

    secret = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
    JWT.decode(token, secret, true, algorithm: 'HS256')

    @current_account = account
    @current_user    = User.find_by!(account: account)
  rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound => e
    render_unauthorized(e.message)
  end
end
```

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api
bundle exec rspec --format documentation 2>&1
```

Expected: 50 examples, 0 failures (46 existing + 4 new refresh specs).

- [ ] **Step 3: Commit**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api
git add app/controllers/application_controller.rb
git commit -m "feat: reject refresh tokens in authenticate!"
```

---

## Task 4: Frontend — axios + environment

**Files:**
- Create: `.env.local`
- Install: axios

- [ ] **Step 1: Create .env.local**

Create `/Users/oscarortega/work/ekklesia/ekklesia-client/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 2: Install axios**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
npm install axios
```

Expected: axios added to `package.json` dependencies.

- [ ] **Step 3: Confirm install**

```bash
grep '"axios"' package.json
```

Expected: `"axios": "^1.x.x"` (or similar).

- [ ] **Step 4: Commit**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
git add .env.local package.json package-lock.json
git commit -m "chore: add axios and API URL env var"
```

Note: `.env.local` is gitignored by Next.js by default. If `git add .env.local` says nothing to add, create a `.env.local.example` instead and commit that:

```bash
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local.example
git add .env.local.example package.json package-lock.json
git commit -m "chore: add axios and API URL config"
```

---

## Task 5: Frontend — axios client

**Files:**
- Create: `lib/api/client.ts`

- [ ] **Step 1: Create the lib/api directory**

```bash
mkdir -p /Users/oscarortega/work/ekklesia/ekklesia-client/lib/api
```

- [ ] **Step 2: Create lib/api/client.ts**

```typescript
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios'

// ── Module-level token storage ───────────────────────────────────────
// AuthContext calls setAccessToken() and setAuthCallbacks() after mount.
let _accessToken: string | null = null
let _onRefreshToken: (() => Promise<string | null>) | null = null
let _onLogout: (() => void) | null = null

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export function setAuthCallbacks(callbacks: {
  onRefreshToken: () => Promise<string | null>
  onLogout: () => void
}) {
  _onRefreshToken = callbacks.onRefreshToken
  _onLogout = callbacks.onLogout
}

// ── Axios instance ────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: inject Bearer token ─────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`
  }
  return config
})

// ── Response interceptor: handle 401 with refresh + retry ────────────
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function flushQueue(err: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token!)
  )
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Queue concurrent 401s while refreshing
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers!.Authorization = `Bearer ${token}`
        return apiClient(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const newToken = _onRefreshToken ? await _onRefreshToken() : null
      if (!newToken) {
        flushQueue(new Error('Token refresh failed'))
        _onLogout?.()
        return Promise.reject(error)
      }
      flushQueue(null, newToken)
      original.headers!.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } catch (refreshErr) {
      flushQueue(refreshErr)
      _onLogout?.()
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to `lib/api/client.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/api/client.ts
git commit -m "feat: add axios client with token interceptors"
```

---

## Task 6: Frontend — AuthContext

**Files:**
- Create: `lib/auth/context.tsx`

- [ ] **Step 1: Create the lib/auth directory**

```bash
mkdir -p /Users/oscarortega/work/ekklesia/ekklesia-client/lib/auth
```

- [ ] **Step 2: Create lib/auth/context.tsx**

```typescript
'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import apiClient, { setAccessToken, setAuthCallbacks } from '@/lib/api/client'

// ── Types ─────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number
  email: string
  role: 'superadmin' | 'lead_pastor' | 'pastor' | 'assistant'
  ministry_id: number | null
  church_id: number | null
  first_name: string
  last_name: string
  full_name: string
  phone: string | null
}

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// ── Helpers ───────────────────────────────────────────────────────────
const REFRESH_KEY = 'ekklesia_refresh'

function rolePath(role: string): string {
  const map: Record<string, string> = {
    superadmin: '/superadmin',
    lead_pastor: '/lead-pastor',
    pastor: '/pastor',
    assistant: '/assistant',
  }
  return map[role] ?? '/'
}

// ── Context ───────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Keep axios module ref in sync with React state
  const updateToken = useCallback((token: string | null) => {
    setAccessTokenState(token)
    setAccessToken(token)
  }, [])

  const doLogout = useCallback(() => {
    localStorage.removeItem(REFRESH_KEY)
    updateToken(null)
    setUser(null)
    router.replace('/')
  }, [updateToken, router])

  // Uses plain fetch to avoid the axios interceptor (prevents infinite loop)
  const refreshTokenFn = useCallback(async (): Promise<string | null> => {
    const stored = localStorage.getItem(REFRESH_KEY)
    if (!stored) return null
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: stored }),
        }
      )
      if (!res.ok) return null
      const data = await res.json()
      updateToken(data.access_token)
      return data.access_token
    } catch {
      return null
    }
  }, [updateToken])

  // Wire axios callbacks once on mount
  useEffect(() => {
    setAuthCallbacks({
      onRefreshToken: refreshTokenFn,
      onLogout: doLogout,
    })
  }, [refreshTokenFn, doLogout])

  // Hydrate from stored refresh token on page load
  useEffect(() => {
    const hydrate = async () => {
      const stored = localStorage.getItem(REFRESH_KEY)
      if (!stored) {
        setIsLoading(false)
        return
      }
      try {
        const newToken = await refreshTokenFn()
        if (!newToken) {
          localStorage.removeItem(REFRESH_KEY)
          setIsLoading(false)
          return
        }
        const { data } = await apiClient.get('/api/v1/auth/me')
        setUser(data.user)
      } catch {
        localStorage.removeItem(REFRESH_KEY)
      } finally {
        setIsLoading(false)
      }
    }
    hydrate()
  }, [refreshTokenFn])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await apiClient.post('/api/v1/auth/login', {
        login: email,
        password,
      })
      localStorage.setItem(REFRESH_KEY, data.refresh_token)
      updateToken(data.access_token)
      const me = await apiClient.get('/api/v1/auth/me')
      const userData: AuthUser = me.data.user
      setUser(userData)
      router.push(rolePath(userData.role))
    },
    [updateToken, router]
  )

  const logout = useCallback(async () => {
    try {
      await apiClient.delete('/api/v1/auth/logout')
    } catch {
      // best-effort
    }
    doLogout()
  }, [doLogout])

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors in `lib/auth/context.tsx`.

- [ ] **Step 4: Commit**

```bash
git add lib/auth/context.tsx
git commit -m "feat: add AuthContext with login/logout/hydration"
```

---

## Task 7: Frontend — ProtectedRoute

**Files:**
- Create: `lib/auth/guard.tsx`

- [ ] **Step 1: Create lib/auth/guard.tsx**

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'

type Role = 'superadmin' | 'lead_pastor' | 'pastor' | 'assistant'

const ROLE_PATHS: Record<Role, string> = {
  superadmin:  '/superadmin',
  lead_pastor: '/lead-pastor',
  pastor:      '/pastor',
  assistant:   '/assistant',
}

interface ProtectedRouteProps {
  role: Role
  children: React.ReactNode
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/')
      return
    }
    if (user.role !== role) {
      router.replace(ROLE_PATHS[user.role as Role] ?? '/')
    }
  }, [user, isLoading, role, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== role) return null

  return <>{children}</>
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/auth/guard.tsx
git commit -m "feat: add ProtectedRoute component"
```

---

## Task 8: Frontend — Wire AuthProvider + role layouts

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/superadmin/layout.tsx`
- Create: `app/lead-pastor/layout.tsx`
- Create: `app/pastor/layout.tsx`
- Create: `app/assistant/layout.tsx`

- [ ] **Step 1: Update app/layout.tsx**

Read the current file first:
```bash
cat /Users/oscarortega/work/ekklesia/ekklesia-client/app/layout.tsx
```

Replace with:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth/context'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Iglesia Digital - Plataforma de Gestion',
  description: 'Sistema de gestion integral para iglesias cristianas',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create app/superadmin/layout.tsx**

```typescript
import { ProtectedRoute } from '@/lib/auth/guard'

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute role="superadmin">{children}</ProtectedRoute>
}
```

- [ ] **Step 3: Create app/lead-pastor/layout.tsx**

```typescript
import { ProtectedRoute } from '@/lib/auth/guard'

export default function LeadPastorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute role="lead_pastor">{children}</ProtectedRoute>
}
```

- [ ] **Step 4: Create app/pastor/layout.tsx**

```typescript
import { ProtectedRoute } from '@/lib/auth/guard'

export default function PastorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute role="pastor">{children}</ProtectedRoute>
}
```

- [ ] **Step 5: Create app/assistant/layout.tsx**

```typescript
import { ProtectedRoute } from '@/lib/auth/guard'

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute role="assistant">{children}</ProtectedRoute>
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/superadmin/layout.tsx app/lead-pastor/layout.tsx \
        app/pastor/layout.tsx app/assistant/layout.tsx
git commit -m "feat: wrap app with AuthProvider and protect role routes"
```

---

## Task 9: Frontend — Real login

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Read the current login page**

```bash
cat /Users/oscarortega/work/ekklesia/ekklesia-client/app/page.tsx
```

- [ ] **Step 2: Replace the handleLogin function**

Find this block (approximately lines 176–202):
```typescript
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useI18n()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login - in real app, this would authenticate
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Demo routing based on email domain for different roles
    if (email.includes("super")) {
      router.push("/superadmin")
    } else if (email.includes("lead") || email.includes("principal")) {
      router.push("/lead-pastor")
    } else if (email.includes("pastor")) {
      router.push("/pastor")
    } else {
      router.push("/assistant")
    }
  }
```

Replace with:
```typescript
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const { t } = useI18n()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)
    try {
      await login(email, password)
      // AuthContext.login handles redirect based on role
    } catch {
      setLoginError(t("auth.invalidCredentials") || "Credenciales incorrectas. Intenta de nuevo.")
      setIsLoading(false)
    }
  }
```

- [ ] **Step 3: Add useAuth import**

At the top of `app/page.tsx`, add to the existing imports:

```typescript
import { useAuth } from '@/lib/auth/context'
```

Also remove the unused `useRouter` import if no other part of the file uses `router` directly (the `const router = useRouter()` line can also be removed since `AuthContext` handles navigation now).

- [ ] **Step 4: Add error message in JSX**

Find where the submit button is rendered in the JSX. Add an error display just above the button:

```tsx
{/* Error message */}
{loginError && (
  <motion.p
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-red-400 text-sm text-center"
  >
    {loginError}
  </motion.p>
)}
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: connect login page to real API auth"
```

---

## Task 10: Frontend — Header with real user data

**Files:**
- Modify: `components/dashboard/header.tsx`

- [ ] **Step 1: Read the current header**

```bash
cat /Users/oscarortega/work/ekklesia/ekklesia-client/components/dashboard/header.tsx
```

- [ ] **Step 2: Make userName/userRole optional and use useAuth as fallback**

At the top of the file, add the import:
```typescript
import { useAuth } from '@/lib/auth/context'
```

Change the `HeaderProps` interface:
```typescript
interface HeaderProps {
  title: string
  userName?: string
  userRole?: string
  onMenuClick?: () => void
}
```

Change the component signature and add the hook:
```typescript
export function Header({ title, userName: userNameProp, userRole: userRoleProp, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()

  const ROLE_LABELS: Record<string, string> = {
    superadmin:  'Super Admin',
    lead_pastor: 'Pastor Principal',
    pastor:      'Pastor',
    assistant:   'Asistente',
  }

  const userName = userNameProp ?? user?.full_name ?? ''
  const userRole = userRoleProp ?? (user ? (ROLE_LABELS[user.role] ?? user.role) : '')
```

- [ ] **Step 3: Wire the real logout**

Find the existing `handleLogout` function in the header:
```typescript
const handleLogout = () => {
  router.push("/")
}
```

Replace with:
```typescript
const handleLogout = async () => {
  await logout()
}
```

Since `logout()` from `useAuth` already calls `router.replace('/')`, the `useRouter` import and `router` variable can be removed from the header if `router` is not used elsewhere in the component. Check if `router` is used anywhere else in the file before removing it.

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/header.tsx
git commit -m "feat: header shows real user name and role, wires real logout"
```

---

## Task 11: Smoke test — end-to-end auth

- [ ] **Step 1: Start the Rails API on port 3001**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api
rails server -p 3001
```

- [ ] **Step 2: Start the Next.js dev server**

In a separate terminal:
```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
npm run dev
```

- [ ] **Step 3: Test login with superadmin**

Open `http://localhost:3000` in a browser.

Log in with:
- Email: `admin@ekklesia.dev`
- Password: `Ekklesia2026!`

Expected:
- No CORS errors in browser console
- Redirect to `/superadmin`
- Header shows "Super Admin" as name and "Super Admin" as role

- [ ] **Step 4: Test page reload**

While on `/superadmin`, reload the page (Cmd+R / F5).

Expected:
- Brief spinner while `isLoading === true`
- Dashboard re-renders without redirecting to login
- `localStorage` has `ekklesia_refresh` key with a JWT value

- [ ] **Step 5: Test logout**

Click the logout button in the header.

Expected:
- Redirect to `/` (login page)
- `ekklesia_refresh` removed from `localStorage`

- [ ] **Step 6: Test direct URL access without auth**

Log out, then navigate directly to `http://localhost:3000/superadmin`.

Expected: redirect to `/` (login page).

- [ ] **Step 7: Run full API test suite one last time**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api
bundle exec rspec --format documentation 2>&1 | tail -5
```

Expected: 50 examples, 0 failures.

- [ ] **Step 8: Final commit on client**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
git add -A
git commit -m "feat: complete auth integration — login, refresh, protect routes"
```
