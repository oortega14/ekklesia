import apiClient from './client'

export interface PendingService {
  id: number
  service_type: string
  scheduled_at: string | null
  church_id: number
  church_name: string | null
}

export interface RecentReport {
  id: number
  service_id: number
  service_type: string
  service_date: string | null
  church_name: string | null
  adults: number
  youth: number
  children: number
  total: number
  notes: string | null
  submitted_at: string | null
}

export interface AttendanceSubmissionResponse {
  pending_services: PendingService[]
  recent_reports:   RecentReport[]
}

export interface SubmitAttendancePayload {
  service_id: number
  adults: number
  youth: number
  children: number
  notes?: string
}

export async function getAttendanceSubmission(): Promise<AttendanceSubmissionResponse> {
  const { data } = await apiClient.get<AttendanceSubmissionResponse>('/api/v1/attendance_submission')
  return data
}

export async function submitAttendance(payload: SubmitAttendancePayload): Promise<void> {
  await apiClient.post('/api/v1/attendance_reports', { attendance_report: payload })
}
