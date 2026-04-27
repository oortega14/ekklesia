import apiClient from './client'

export type ServiceRequestStatus = 'pending' | 'approved' | 'rejected'

export interface PendingRequest {
  id: number
  service_type: string
  requested_for: string | null
  requested_by_name: string | null
  church_id: number
  church_name: string | null
  notes: string | null
}

export interface MyRequest {
  id: number
  service_type: string
  requested_for: string | null
  status: ServiceRequestStatus
  reviewed_by_name: string | null
  reviewed_at: string | null
  church_name: string | null
  notes: string | null
}

export interface RecentResolved {
  id: number
  service_type: string
  requested_for: string | null
  status: 'approved' | 'rejected'
  requested_by_name: string | null
  reviewed_by_name: string | null
  reviewed_at: string | null
  church_name: string | null
}

export interface UpcomingService {
  id: number
  service_type: string
  scheduled_at: string | null
  church_id: number
  church_name: string | null
  has_attendance_report: boolean
}

export interface ServicesOverviewResponse {
  pending_requests: PendingRequest[]
  my_requests:      MyRequest[]
  recent_resolved:  RecentResolved[]
  upcoming_services: UpcomingService[]
}

export interface CreateServiceRequestPayload {
  service_type: string
  requested_for: string  // ISO datetime
  notes?: string
}

export interface CreateServicePayload {
  church_id: number
  service_type: string
  scheduled_at: string
}

export async function getServicesOverview(): Promise<ServicesOverviewResponse> {
  const { data } = await apiClient.get<ServicesOverviewResponse>('/api/v1/services_overview')
  return data
}

export async function createServiceRequest(payload: CreateServiceRequestPayload): Promise<void> {
  await apiClient.post('/api/v1/service_requests', { service_request: payload })
}

export async function approveServiceRequest(id: number): Promise<void> {
  await apiClient.patch(`/api/v1/service_requests/${id}/approve`)
}

export async function rejectServiceRequest(id: number): Promise<void> {
  await apiClient.patch(`/api/v1/service_requests/${id}/reject`)
}

export async function createService(payload: CreateServicePayload): Promise<void> {
  await apiClient.post('/api/v1/services', { service: payload })
}
