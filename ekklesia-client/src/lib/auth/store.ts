import { create } from 'zustand'
import apiClient, { setAccessToken } from '@/lib/api/client'

const AUTH_TOKEN_MISSING_ERROR = 'AUTH_TOKEN_MISSING'

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

interface AuthStoreState {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  updateToken: (token: string | null) => void
  clearSession: () => void
  refreshToken: () => Promise<string | null>
  hydrate: () => Promise<void>
  finalizeAuth: (accessTokenValue: string, refreshTokenValue?: string) => Promise<void>
  loginRaw: (email: string, password: string) => Promise<void>
  logoutRaw: () => Promise<void>
}

const REFRESH_KEY = 'ekklesia_refresh'

function parseBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null
  const parts = authHeader.trim().split(/\s+/)
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1]
  }
  return authHeader
}

function extractAccessToken(payload: unknown, headers?: Record<string, unknown>): string | null {
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>
    const flat = data.access_token || data.token || data.jwt
    if (typeof flat === 'string' && flat.length > 0) return flat

    if (data.token && typeof data.token === 'object') {
      const nested = (data.token as Record<string, unknown>).access_token
      if (typeof nested === 'string' && nested.length > 0) return nested
    }
  }

  const authHeader = headers?.authorization
  if (typeof authHeader === 'string') {
    return parseBearerToken(authHeader)
  }

  return null
}

export function rolePath(role: string): string {
  const map: Record<string, string> = {
    superadmin: '/superadmin',
    lead_pastor: '/lead-pastor',
    pastor: '/pastor',
    assistant: '/assistant',
  }
  return map[role] ?? '/'
}

export const ROLE_LABELS: Record<string, string> = {
  superadmin:  'Super Administrador',
  lead_pastor: 'Pastor Principal',
  pastor:      'Pastor',
  assistant:   'Ayudante',
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  updateToken: (token) => {
    set({ accessToken: token })
    setAccessToken(token)
  },

  clearSession: () => {
    localStorage.removeItem(REFRESH_KEY)
    get().updateToken(null)
    set({ user: null })
  },

  refreshToken: async () => {
    const stored = localStorage.getItem(REFRESH_KEY)
    if (!stored) return null

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: stored }),
      })

      if (!res.ok) return null

      const data = await res.json()
      get().updateToken(data.access_token)
      return data.access_token
    } catch {
      return null
    }
  },

  hydrate: async () => {
    const stored = localStorage.getItem(REFRESH_KEY)
    if (!stored) {
      set({ isLoading: false })
      return
    }

    try {
      const newToken = await get().refreshToken()
      if (!newToken) {
        localStorage.removeItem(REFRESH_KEY)
        set({ isLoading: false })
        return
      }

      const { data } = await apiClient.get('/api/v1/auth/me')
      set({ user: data.user })
    } catch {
      localStorage.removeItem(REFRESH_KEY)
    } finally {
      set({ isLoading: false })
    }
  },

  finalizeAuth: async (accessTokenValue, refreshTokenValue) => {
    if (refreshTokenValue) {
      localStorage.setItem(REFRESH_KEY, refreshTokenValue)
    }

    get().updateToken(accessTokenValue)
    const me = await apiClient.get('/api/v1/auth/me')
    set({ user: me.data.user })
  },

  loginRaw: async (email, password) => {
    const response = await apiClient.post('/api/v1/auth/login', {
      email,
      login: email,
      password,
    })

    const accessToken = extractAccessToken(
      response.data,
      response.headers as Record<string, unknown>
    )
    if (!accessToken) {
      throw new Error(AUTH_TOKEN_MISSING_ERROR)
    }

    await get().finalizeAuth(accessToken, response.data?.refresh_token)
  },

  logoutRaw: async () => {
    try {
      await apiClient.delete('/api/v1/auth/logout')
    } catch {
      // best-effort
    }
    get().clearSession()
  },
}))
