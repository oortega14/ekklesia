import apiClient from './client'

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export interface ChangePasswordResponse {
  access_token: string
  refresh_token: string
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const { data } = await apiClient.post<ChangePasswordResponse>('/api/v1/auth/change-password', {
    password:           payload.current_password,
    'new-password':     payload.new_password,
    'password-confirm': payload.new_password
  })
  return data
}
