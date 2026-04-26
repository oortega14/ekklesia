import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/components/dashboard/settings-page'

export const Route = createFileRoute('/assistant/settings')({
  component: () => <SettingsPage role="assistant" />
})
