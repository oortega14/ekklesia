import apiClient from './client'

export interface Stats {
  total_churches: number
  total_users: number
  services_this_month: number
  total_contributions_amount: number
  total_attendance: number
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

export async function getStats(): Promise<Stats> {
  const { data } = await apiClient.get<Stats>('/api/v1/stats')
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
