import request from './request'
import type { AxiosResponse } from 'axios'

export async function logout(): Promise<void> {
  const response: AxiosResponse<void> = await request.post('/auth/logout')
  return response.data
}