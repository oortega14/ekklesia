import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
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
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      navigate({ to: '/', replace: true })
      return
    }
    if (user.role !== role) {
      navigate({ to: ROLE_PATHS[user.role as Role] ?? '/', replace: true })
    }
  }, [user, isLoading, role, navigate])

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
