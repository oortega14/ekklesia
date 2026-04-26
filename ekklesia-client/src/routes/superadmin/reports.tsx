import { createFileRoute } from '@tanstack/react-router'
import { ReportsView } from '@/components/dashboard/reports-view'

export const Route = createFileRoute('/superadmin/reports')({
  component: () => <ReportsView role="superadmin" />
})
