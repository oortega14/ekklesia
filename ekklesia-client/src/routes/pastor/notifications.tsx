import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/components/dashboard/notifications-page'

export const Route = createFileRoute('/pastor/notifications')({
  component: () => <NotificationsPage role="pastor" />
})
