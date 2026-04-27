import { createFileRoute } from '@tanstack/react-router'
import { LeadPastorServicesPage } from '@/components/dashboard/lead-pastor-services-page'

export const Route = createFileRoute('/lead-pastor/services')({
  component: () => <LeadPastorServicesPage />
})
