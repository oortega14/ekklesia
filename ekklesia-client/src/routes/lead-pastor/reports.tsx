import { createFileRoute } from '@tanstack/react-router'
import { ReportsView } from '@/components/dashboard/reports-view'

export const Route = createFileRoute('/lead-pastor/reports')({
  component: () => <ReportsView role="lead_pastor" />
})
