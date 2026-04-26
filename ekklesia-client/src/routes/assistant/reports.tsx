import { createFileRoute } from '@tanstack/react-router'
import { ReportsView } from '@/components/dashboard/reports-view'

export const Route = createFileRoute('/assistant/reports')({
  component: () => <ReportsView role="assistant" />
})
