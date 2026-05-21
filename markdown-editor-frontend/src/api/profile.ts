import request from './request'

export interface PasswordUpdate {
  oldPassword: string
  newPassword: string
}

export async function updatePassword(oldPassword: string, newPassword: string): Promise<void> {
  const data: PasswordUpdate = { oldPassword, newPassword }
  await request.put('/auth/password', data)
}

export { getProfile } from './auth'