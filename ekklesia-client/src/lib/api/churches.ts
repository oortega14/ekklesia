import apiClient from './client'

export type ChurchStatus = 'active' | 'pending' | 'inactive'

export interface ChurchRow {
  id: number
  name: string
  address: string | null
  city: string | null
  email: string | null
  phone: string | null
  status: ChurchStatus
  ministry_id: number
  lead_pastor_name: string | null
  users_count: number
}

export interface ListChurchesParams {
  page?: number
  perPage?: number
}

export async function listChurches(params: ListChurchesParams = {}): Promise<ChurchRow[]> {
  const { data } = await apiClient.get<{ churches: ChurchRow[] }>('/api/v1/churches', {
    params: { page: params.page, per_page: params.perPage }
  })
  return data.churches
}

export interface CreateChurchPayload {
  name: string
  city?: string
  address?: string
  email?: string
  phone?: string
  status?: ChurchStatus
  ministry_id?: number
}

export interface UpdateChurchPayload {
  name?: string
  city?: string
  address?: string
  email?: string
  phone?: string
  status?: ChurchStatus
}

export async function createChurch(payload: CreateChurchPayload): Promise<void> {
  await apiClient.post('/api/v1/churches', { church: payload })
}

export async function updateChurch(id: number, payload: UpdateChurchPayload): Promise<void> {
  await apiClient.put(`/api/v1/churches/${id}`, { church: payload })
}

export async function deleteChurch(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/churches/${id}`)
}
