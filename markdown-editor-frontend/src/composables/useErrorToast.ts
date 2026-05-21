import { ElMessage } from 'element-plus'

export interface ErrorToastOptions {
  message: string
  duration?: number
}

export const useErrorToast = () => {
  const showError = (options: ErrorToastOptions) => {
    const { message, duration = 5000 } = options
    ElMessage.error({
      message,
      duration,
      customClass: 'error-toast-dark'
    })
  }

  return {
    showError
  }
}

export default useErrorToast