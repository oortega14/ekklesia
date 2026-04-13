import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/lib/auth/guard'

export const Route = createFileRoute('/assistant')({
  component: () => (
    <ProtectedRoute role="assistant">
      <Outlet />
    </ProtectedRoute>
  ),
})
