import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/components/dashboard/settings-page'

export const Route = createFileRoute('/superadmin/settings')({
  component: () => <SettingsPage role="superadmin" />
})
