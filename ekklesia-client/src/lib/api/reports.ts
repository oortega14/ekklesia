import apiClient from './client'
import type { ContributionType, ContributionBreakdownItem } from './stats'

export type ReportPeriod = 'this_month' | 'this_quarter' | 'this_year'

export interface AttendanceRow {
  id: number
  service_id: number
  service_type: string
  scheduled_at: string | null
  church_id: number
  church_name: string | null
  adults: number
  youth: number
  children: number
  total: number
  reported_by_name: string | null
  submitted_at: string | null
}

export interface AttendanceSummary {
  total_count: number
  total_attendance: number
  average_per_service: number
  period_label: string
}

export interface AttendanceReportResponse {
  rows: AttendanceRow[]
  summary: AttendanceSummary
  truncated: boolean
}

export interface ContributionRow {
  id: number
  service_id: number
  service_type: string
  scheduled_at: string | null
  church_id: number
  church_name: string | null
  type: ContributionType
  amount: number
  reported_by_name: string | null
  submitted_at: string | null
}

export interface ContributionSummary {
  total_count: number
  total_amount: number
  breakdown_by_type: ContributionBreakdownItem[]
  period_label: string
}

export interface ContributionsReportResponse {
  rows: ContributionRow[]
  summary: ContributionSummary
  truncated: boolean
}

export interface ReportFilters {
  period: ReportPeriod
  church_id?: number
  /**
   * Tab-specific filter:
   *  - attendance tab: maps to `service_type` query param
   *  - contributions tab: maps to `contribution_type` query param
   */
  type?: string
}

function attendanceParams(f: ReportFilters): Record<string, string | number> {
  const out: Record<string, string | number> = { period: f.period }
  if (f.church_id !== undefined) out.church_id = f.church_id
  if (f.type) out.service_type = f.type
  return out
}

function contributionsParams(f: ReportFilters): Record<string, string | number> {
  const out: Record<string, string | number> = { period: f.period }
  if (f.church_id !== undefined) out.church_id = f.church_id
  if (f.type) out.contribution_type = f.type
  return out
}

export async function getAttendanceReport(filters: ReportFilters): Promise<AttendanceReportResponse> {
  const { data } = await apiClient.get<AttendanceReportResponse>('/api/v1/reports/attendance', {
    params: attendanceParams(filters)
  })
  return data
}

export async function getContributionsReport(filters: ReportFilters): Promise<ContributionsReportResponse> {
  const { data } = await apiClient.get<ContributionsReportResponse>('/api/v1/reports/contributions', {
    params: contributionsParams(filters)
  })
  return data
}

// CSV download (auth-aware)
//
// window.open / location.href won't include the Authorization header from
// the axios singleton, so we fetch the bytes ourselves, wrap them in a
// Blob, and click an invisible <a download>. Works in modern Chrome,
// Firefox, and Safari.

function filenameFromContentDisposition(header: string | undefined, fallback: string): string {
  if (!header) return fallback
  const match = /filename="?([^";]+)"?/i.exec(header)
  return match?.[1] ?? fallback
}

async function downloadCsv(
  url: string,
  params: Record<string, string | number>,
  fallbackFilename: string
): Promise<void> {
  const res = await apiClient.get<Blob>(url, {
    params: { ...params, format: 'csv' },
    responseType: 'blob'
  })
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
  const filename = filenameFromContentDisposition(
    res.headers['content-disposition'] as string | undefined,
    fallbackFilename
  )
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}

export async function downloadAttendanceCsv(filters: ReportFilters): Promise<void> {
  await downloadCsv('/api/v1/reports/attendance', attendanceParams(filters), 'asistencia.csv')
}

export async function downloadContributionsCsv(filters: ReportFilters): Promise<void> {
  await downloadCsv('/api/v1/reports/contributions', contributionsParams(filters), 'finanzas.csv')
}
