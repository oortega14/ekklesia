import { ReactNode, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { setAuthCallbacks } from '@/lib/api/client'
import {
  AuthUser,
  SignupPayload,
  rolePath,
  useAuthStore,
} from '@/lib/auth/store'

export type { AuthUser, SignupPayload } from '@/lib/auth/store'

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  logout: () => Promise<void>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate)
  const hasHydrated = useRef(false)

  useEffect(() => {
    setAuthCallbacks({
      onRefreshToken: () => useAuthStore.getState().refreshToken(),
      onLogout: () => useAuthStore.getState().clearSession(),
    })
  }, [])

  useEffect(() => {
    if (hasHydrated.current) return
    hasHydrated.current = true
    void hydrate()
  }, [hydrate])

  return <>{children}</>
}

export function useAuth(): AuthContextType {
  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const isLoading = useAuthStore((state) => state.isLoading)
  const loginRaw = useAuthStore((state) => state.loginRaw)
  const signupRaw = useAuthStore((state) => state.signupRaw)
  const logoutRaw = useAuthStore((state) => state.logoutRaw)

  const login = useCallback(
    async (email: string, password: string) => {
      await loginRaw(email, password)
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        navigate({ to: rolePath(currentUser.role) })
      }
    },
    [loginRaw, navigate]
  )

  const signup = useCallback(
    async (payload: SignupPayload) => {
      await signupRaw(payload)
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        navigate({ to: rolePath(currentUser.role) })
      }
    },
    [signupRaw, navigate]
  )

  const logout = useCallback(async () => {
    await logoutRaw()
    navigate({ to: '/', replace: true })
  }, [logoutRaw, navigate])

  return {
    user,
    accessToken,
    isLoading,
    login,
    signup,
    logout,
  }
}
