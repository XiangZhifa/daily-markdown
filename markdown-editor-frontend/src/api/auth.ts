import request from './request'

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
  const response = await request.post<AuthResponse>('/auth/login', data)
  return response as unknown as AuthResponse
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await request.post<AuthResponse>('/auth/register', data)
  return response as unknown as AuthResponse
}

export async function getProfile(): Promise<UserProfile> {
  const response = await request.get<UserProfile>('/auth/profile')
  return response as unknown as UserProfile
}

export async function logout(): Promise<void> {
  await request.post('/auth/logout')
}

export async function updatePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  await request.put('/auth/password', {
    oldPassword,
    newPassword,
  })
  return { message: 'Password updated successfully' }
}