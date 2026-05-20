import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginData, RegisterData } from '@/api/auth'

const REMEMBER_ME_KEY = 'rememberMe'

export function useAuth() {
  const store = useAuthStore()
  const rememberMe = ref<boolean>(localStorage.getItem(REMEMBER_ME_KEY) === 'true')

  const isLoggedIn = computed(() => store.isLoggedIn)
  const user = computed(() => store.user)

  async function login(username: string, password: string): Promise<void> {
    const loginData: LoginData = { username, password }
    await store.loginAction(loginData)
    if (rememberMe.value) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true')
    }
  }

  async function register(username: string, email: string, password: string): Promise<void> {
    const registerData: RegisterData = { username, email, password }
    await store.registerAction(registerData)
    if (rememberMe.value) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true')
    }
  }

  function logout(): void {
    localStorage.removeItem(REMEMBER_ME_KEY)
    store.logoutAction()
  }

  function setRememberMe(value: boolean): void {
    rememberMe.value = value
    if (!value) {
      localStorage.removeItem(REMEMBER_ME_KEY)
    }
  }

  return {
    login,
    register,
    logout,
    isLoggedIn,
    user,
    rememberMe,
    setRememberMe,
  }
}
