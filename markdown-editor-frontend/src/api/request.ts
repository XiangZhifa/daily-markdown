import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - unwrap {code, data, message} to return just data
request.interceptors.response.use(
  (response) => {
    const unwrapped = response.data
    // If response has the standard wrapper format with success code, unwrap it
    if (unwrapped && typeof unwrapped === 'object' && 'data' in unwrapped && 'code' in unwrapped) {
      // Only unwrap if code is 0 (success)
      if (unwrapped.code === 0) {
        return unwrapped.data
      }
      // For error responses with code !== 0, reject the promise with the error info
      return Promise.reject({
        code: unwrapped.code,
        message: unwrapped.message,
        data: unwrapped.data
      })
    }
    return unwrapped
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        localStorage.removeItem('token')
        ElMessage.error('Session expired, please login again')
        router.push('/auth/login')
      } else if (status === 403) {
        ElMessage.error('Access denied')
      } else if (status === 500) {
        ElMessage.error('Server error')
      }
    } else {
      ElMessage.error('Network error')
    }
    return Promise.reject(error)
  }
)

export default request