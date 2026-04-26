import apiClient from './client'

export type UserRole = 'lead_pastor' | 'pastor' | 'assistant'

export interface UserRow {
  id: number
  email: string | null
  first_name: string
  last_name: string
  full_name: string
  role: UserRole
  ministry_id: number | null
  ministry_name: string | null
  church_id: number | null
  church_name: string | null
}

export interface ListUsersParams {
  page?: number
  perPage?: number
}

export interface CreateUserPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
  role: UserRole
  ministry_id?: number
  church_id?: number
}

export interface UpdateUserPayload {
  first_name?: string
  last_name?: string
  phone?: string
  church_id?: number
}

export async function listUsers(params: ListUsersParams = {}): Promise<UserRow[]> {
  const { data } = await apiClient.get<{ users: UserRow[] }>('/api/v1/users', {
    params: { page: params.page, per_page: params.perPage }
  })
  return data.users
}

export async function createUser(payload: CreateUserPayload): Promise<UserRow> {
  const { data } = await apiClient.post<{ user: UserRow }>('/api/v1/users', { user: payload })
  return data.user
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<UserRow> {
  const { data } = await apiClient.patch<{ user: UserRow }>(`/api/v1/users/${id}`, { user: payload })
  return data.user
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/users/${id}`)
}
