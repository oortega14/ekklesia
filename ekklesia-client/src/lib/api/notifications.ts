import apiClient from './client'

export type NotificationKind =
  | 'ministry_created'
  | 'service_request_created'
  | 'service_request_approved'
  | 'service_request_rejected'
  | 'attendance_report_submitted'
  | 'contribution_recorded'
  | 'user_created'
  | 'church_created'

export interface NotificationRow {
  id: number
  kind: NotificationKind
  payload: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export interface ListNotificationsParams {
  page?: number
  perPage?: number
  unread?: boolean
  kind?: NotificationKind
}

export interface ListNotificationsResponse {
  notifications: NotificationRow[]
  unread_count: number
  meta: { current_page: number; total_pages: number; total_count: number }
}

export async function listNotifications(params: ListNotificationsParams = {}): Promise<ListNotificationsResponse> {
  const { data } = await apiClient.get<ListNotificationsResponse>('/api/v1/notifications', {
    params: {
      page: params.page,
      per_page: params.perPage,
      unread: params.unread ? 'true' : undefined,
      kind: params.kind
    }
  })
  return data
}

export async function markNotificationRead(id: number): Promise<NotificationRow> {
  const { data } = await apiClient.patch<{ notification: NotificationRow }>(`/api/v1/notifications/${id}/read`)
  return data.notification
}

export async function markAllNotificationsRead(): Promise<{ unread_count: number }> {
  const { data } = await apiClient.post<{ unread_count: number }>('/api/v1/notifications/read_all')
  return data
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/notifications/${id}`)
}
