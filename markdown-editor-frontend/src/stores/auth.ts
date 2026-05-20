import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, getProfile, logout } from '@/api/auth'
import router from '@/router'
import type { LoginData, RegisterData, UserProfile } from '@/api/auth'

const REMEMBERED_USERNAME_KEY = 'remembered-username'

function parseJwt(token: string): { exp: number } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(window.atob(base64))
    return json
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserProfile | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  const isExpired = computed(() => {
    if (!token.value) return true
    const payload = parseJwt(token.value)
    if (!payload) return true
    return Date.now() >= payload.exp * 1000
  })

  const rememberedUsername = computed({
    get: () => localStorage.getItem(REMEMBERED_USERNAME_KEY) || '',
    set: (value: string) => {
      if (value) {
        localStorage.setItem(REMEMBERED_USERNAME_KEY, value)
      } else {
        localStorage.removeItem(REMEMBERED_USERNAME_KEY)
      }
    },
  })

  async function loginAction(loginData: LoginData, rememberMe = false) {
    const data = await login(loginData)
    token.value = data.access_token
    user.value = data.user
    localStorage.setItem('token', data.access_token)
    if (rememberMe) {
      rememberedUsername.value = loginData.username
    }
    return data
  }

  async function registerAction(registerData: RegisterData) {
    const data = await register(registerData)
    token.value = data.access_token
    user.value = data.user
    localStorage.setItem('token', data.access_token)
    return data
  }

  async function logoutAction() {
    try {
      await logout()
    } catch {
      // Ignore logout API errors, still clear local state
    }
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push('/auth/login')
  }

  async function fetchProfile() {
    if (token.value) {
      const profile = await getProfile()
      user.value = profile
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    isExpired,
    rememberedUsername,
    loginAction,
    registerAction,
    logoutAction,
    fetchProfile,
  }
})