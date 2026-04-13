import { createFileRoute } from '@tanstack/react-router'
import { AuthScreen } from '@/components/auth/auth-screen'

function LoginRoute() {
  return <AuthScreen />
}

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})
