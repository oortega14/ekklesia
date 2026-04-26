import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/components/dashboard/settings-page'

export const Route = createFileRoute('/pastor/settings')({
  component: () => <SettingsPage role="pastor" />
})
