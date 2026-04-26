import apiClient from './client'

export interface MinistryRow {
  id: number
  name: string
}

export async function listMinistries(): Promise<MinistryRow[]> {
  const { data } = await apiClient.get<{ ministries: MinistryRow[] }>('/api/v1/ministries', {
    params: { per_page: 100 }
  })
  return data.ministries
}
