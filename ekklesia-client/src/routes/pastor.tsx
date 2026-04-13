import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/lib/auth/guard'

export const Route = createFileRoute('/pastor')({
  component: () => (
    <ProtectedRoute role="pastor">
      <Outlet />
    </ProtectedRoute>
  ),
})
