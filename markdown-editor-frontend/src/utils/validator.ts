export const validator = {
  username(username: string): { valid: boolean; message: string } {
    if (!username) {
      return { valid: false, message: '用户名不能为空' }
    }
    if (username.length < 3) {
      return { valid: false, message: '用户名至少3个字符' }
    }
    if (username.length > 20) {
      return { valid: false, message: '用户名最多20个字符' }
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, message: '用户名只能包含字母、数字和下划线' }
    }
    return { valid: true, message: '' }
  },

  password(password: string): { valid: boolean; message: string; strength: number } {
    if (!password) {
      return { valid: false, message: '密码不能为空', strength: 0 }
    }
    if (password.length < 8) {
      return { valid: false, message: '密码至少8个字符', strength: 0 }
    }
    if (password.length > 128) {
      return { valid: false, message: '密码最多128个字符', strength: 0 }
    }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    strength = Math.min(4, strength)

    if (strength < 2) {
      return { valid: true, message: '密码强度：弱', strength }
    }
    if (strength < 3) {
      return { valid: true, message: '密码强度：中等', strength }
    }
    if (strength < 4) {
      return { valid: true, message: '密码强度：良好', strength }
    }
    return { valid: true, message: '密码强度：强', strength }
  },
}