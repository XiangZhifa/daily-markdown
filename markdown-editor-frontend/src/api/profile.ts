import request from './request'
import type { AxiosResponse } from 'axios'

export interface PasswordUpdate {
  oldPassword: string
  newPassword: string
}

export async function updatePassword(oldPassword: string, newPassword: string): Promise<void> {
  const data: PasswordUpdate = { oldPassword, newPassword }
  const response: AxiosResponse<void> = await request.put('/auth/password', data)
  return response.data
}

export { getProfile } from './auth'