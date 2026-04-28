import apiClient from './client'

export interface SuperadminStats {
  total_churches: number
  total_users: number
  services_this_month: number
  total_contributions_amount: number
  total_attendance: number
}

export interface LeadPastorStats {
  churches_count: number
  pastors_count: number
  services_this_month: number
  total_attendance: number
  total_contributions: number
}

export interface PastorStats {
  services_count: number
  pending_attendance_reports: number
  pending_contributions: number
  assistants_count: number
}

export interface AssistantStats {
  pending_service_requests: number
  submitted_reports_count: number
}

export interface AttendanceTimelinePoint {
  month: string
  label: string
  total: number
}

export type ContributionType = 'Tithe' | 'Offering' | 'Donation' | 'Firstfruit' | 'Covenant'

export interface ContributionBreakdownItem {
  type: ContributionType
  amount: number
}

export async function getSuperadminStats(): Promise<SuperadminStats> {
  const { data } = await apiClient.get<SuperadminStats>('/api/v1/stats')
  return data
}

export async function getAttendanceTimeline(): Promise<AttendanceTimelinePoint[]> {
  const { data } = await apiClient.get<{ timeline: AttendanceTimelinePoint[] }>(
    '/api/v1/stats/attendance_timeline'
  )
  return data.timeline
}

export async function getContributionsBreakdown(): Promise<ContributionBreakdownItem[]> {
  const { data } = await apiClient.get<{ breakdown: ContributionBreakdownItem[] }>(
    '/api/v1/stats/contributions_breakdown'
  )
  return data.breakdown
}

export async function getLeadPastorStats(): Promise<LeadPastorStats> {
  const { data } = await apiClient.get<LeadPastorStats>('/api/v1/stats')
  return data
}

export async function getPastorStats(): Promise<PastorStats> {
  const { data } = await apiClient.get<PastorStats>('/api/v1/stats')
  return data
}

export async function getAssistantStats(): Promise<AssistantStats> {
  const { data } = await apiClient.get<AssistantStats>('/api/v1/stats')
  return data
}
