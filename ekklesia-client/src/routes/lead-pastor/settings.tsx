import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/components/dashboard/settings-page'

export const Route = createFileRoute('/lead-pastor/settings')({
  component: () => <SettingsPage role="lead_pastor" />
})
