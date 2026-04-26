import apiClient from './client'

export interface MinistryRow {
  id: number
  name: string
  country: string | null
  city: string | null
  slug: string
}

export interface CreateMinistryPayload {
  ministry: {
    name: string
    country?: string
    city?: string
  }
  lead_pastor?: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
  }
}

export interface CreateMinistryResult {
  ministry: MinistryRow
  lead_pastor?: {
    id: number
    email: string
    full_name: string
    role: 'lead_pastor'
  }
}

export async function listMinistries(): Promise<MinistryRow[]> {
  const { data } = await apiClient.get<{ ministries: MinistryRow[] }>('/api/v1/ministries', {
    params: { per_page: 100 }
  })
  return data.ministries
}

export async function createMinistry(payload: CreateMinistryPayload): Promise<CreateMinistryResult> {
  const { data } = await apiClient.post<CreateMinistryResult>('/api/v1/ministries', payload)
  return data
}

export async function deleteMinistry(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/ministries/${id}`)
}
