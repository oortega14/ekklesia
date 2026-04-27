import { createFileRoute } from '@tanstack/react-router'
import { AttendanceSubmitPage } from '@/components/dashboard/attendance-submit-page'

export const Route = createFileRoute('/assistant/attendance')({
  component: () => <AttendanceSubmitPage role="assistant" />
})
