import { createFileRoute } from '@tanstack/react-router'
import { PastorServicesPage } from '@/components/dashboard/pastor-services-page'

export const Route = createFileRoute('/pastor/services')({
  component: () => <PastorServicesPage />
})
