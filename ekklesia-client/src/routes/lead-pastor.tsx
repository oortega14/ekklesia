import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/lib/auth/guard'

export const Route = createFileRoute('/lead-pastor')({
  component: () => (
    <ProtectedRoute role="lead_pastor">
      <Outlet />
    </ProtectedRoute>
  ),
})
