import request from './request'
import type { AxiosResponse } from 'axios'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface UserProfile {
  id: number
  username: string
  email: string
  createdAt?: string
}

export interface AuthResponse {
  access_token: string
  user: UserProfile
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response: AxiosResponse<AuthResponse> = await request.post('/auth/login', data)
  return response.data
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response: AxiosResponse<AuthResponse> = await request.post('/auth/register', data)
  return response.data
}

export async function getProfile(): Promise<UserProfile> {
  const response: AxiosResponse<UserProfile> = await request.get('/auth/profile')
  return response.data
}

export async function logout(): Promise<void> {
  await request.post('/auth/logout')
}

export async function updatePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const response: AxiosResponse<{ message: string }> = await request.put('/auth/password', {
    oldPassword,
    newPassword,
  })
  return response.data
}