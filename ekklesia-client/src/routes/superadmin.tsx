import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/lib/auth/guard'

export const Route = createFileRoute('/superadmin')({
  component: () => (
    <ProtectedRoute role="superadmin">
      <Outlet />
    </ProtectedRoute>
  ),
})
