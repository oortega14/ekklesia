import { createFileRoute, Navigate } from '@tanstack/react-router'

function IndexRedirect() {
  return <Navigate to="/login" />
}

export const Route = createFileRoute('/')({
  component: IndexRedirect,
})
