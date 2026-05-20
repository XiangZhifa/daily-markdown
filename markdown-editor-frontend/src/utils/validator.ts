export const validator = {
  username(username: string): { valid: boolean; message: string } {
    if (!username) {
      return { valid: false, message: 'Username is required' }
    }
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters' }
    }
    if (username.length > 20) {
      return { valid: false, message: 'Username must be at most 20 characters' }
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, and underscores' }
    }
    return { valid: true, message: '' }
  },

  password(password: string): { valid: boolean; message: string; strength: number } {
    if (!password) {
      return { valid: false, message: 'Password is required', strength: 0 }
    }
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters', strength: 0 }
    }
    if (password.length > 128) {
      return { valid: false, message: 'Password must be at most 128 characters', strength: 0 }
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
      return { valid: true, message: 'Password is weak', strength }
    }
    if (strength < 3) {
      return { valid: true, message: 'Password is fair', strength }
    }
    if (strength < 4) {
      return { valid: true, message: 'Password is good', strength }
    }
    return { valid: true, message: 'Password is strong', strength }
  },
}