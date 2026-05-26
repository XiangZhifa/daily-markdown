<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validator } from '@/utils/validator'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)

// Validation states
const usernameValidation = ref({ valid: true, message: '' })
const emailValidation = ref({ valid: true, message: '' })
const passwordValidation = ref({ valid: false, message: '', strength: 0 })
const confirmPasswordValidation = ref({ valid: true, message: '' })

// Email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Real-time username validation
watch(() => form.value.username, (username) => {
  usernameValidation.value = validator.username(username)
})

// Real-time email validation
watch(() => form.value.email, (email) => {
  if (!email) {
    emailValidation.value = { valid: true, message: '' }
  } else if (!emailRegex.test(email)) {
    emailValidation.value = { valid: false, message: '邮箱格式无效' }
  } else {
    emailValidation.value = { valid: true, message: '' }
  }
})

// Real-time password validation
watch(() => form.value.password, (password) => {
  passwordValidation.value = validator.password(password)
})

// Real-time confirm password validation
watch(() => form.value.confirmPassword, (confirmPassword) => {
  if (!confirmPassword) {
    confirmPasswordValidation.value = { valid: true, message: '' }
  } else if (form.value.password !== confirmPassword) {
    confirmPasswordValidation.value = { valid: false, message: '两次输入的密码不一致' }
  } else {
    confirmPasswordValidation.value = { valid: true, message: '' }
  }
})

// Computed: all fields valid
const isFormValid = computed(() => {
  return (
    form.value.username &&
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    usernameValidation.value.valid &&
    emailValidation.value.valid &&
    passwordValidation.value.valid &&
    confirmPasswordValidation.value.valid &&
    form.value.password === form.value.confirmPassword
  )
})

// Strength label and color
const strengthLabel = computed(() => {
  const labels = ['非常弱', '弱', '中等', '良好', '强']
  return labels[passwordValidation.value.strength] || '非常弱'
})

const strengthColor = computed(() => {
  const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
  return colors[passwordValidation.value.strength] || '#ef4444'
})

async function handleRegister() {
  if (!isFormValid.value) {
    ElMessage.warning('请正确填写所有字段')
    return
  }

  loading.value = true
  try {
    await authStore.registerAction({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    })
    ElMessage.success('注册成功')
    router.push('/auth/login')
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || ''
    if (message.includes('用户名已被注册') || message.includes('username')) {
      ElMessage.error('用户名已被注册')
    } else {
      ElMessage.error('注册失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-wrapper">
    <div class="register-card">
      <h1 class="text-2xl font-bold mb-6 text-center">Markdown 编辑器</h1>
      <h2 class="text-xl mb-6 text-center">注册</h2>

      <el-form :model="form" @submit.prevent="handleRegister">
        <el-form-item :validate-status="form.username && !usernameValidation.valid ? 'error' : ''">
          <el-input
            v-model="form.username"
            placeholder="用户名 (3-20个字符，a-z0-9_)"
            size="large"
          />
        </el-form-item>
        <div v-if="form.username && !usernameValidation.valid" class="validation-message error">
          {{ usernameValidation.message }}
        </div>

        <el-form-item :validate-status="form.email && !emailValidation.valid ? 'error' : ''">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="邮箱"
            size="large"
          />
        </el-form-item>
        <div v-if="form.email && !emailValidation.valid" class="validation-message error">
          {{ emailValidation.message }}
        </div>

        <el-form-item :validate-status="form.password && !passwordValidation.valid ? 'error' : ''">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码 (至少8个字符)"
            size="large"
          />
        </el-form-item>
        
        <!-- Password strength indicator -->
        <div v-if="form.password" class="strength-indicator mb-4">
          <div class="strength-bar">
            <div
              class="strength-fill"
              :style="{
                width: `${(passwordValidation.strength / 4) * 100}%`,
                backgroundColor: strengthColor
              }"
            ></div>
          </div>
          <div class="strength-label" :style="{ color: strengthColor }">
            {{ strengthLabel }} ({{ passwordValidation.strength }}/4)
          </div>
        </div>

        <el-form-item :validate-status="form.confirmPassword && !confirmPasswordValidation.valid ? 'error' : ''">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
          />
        </el-form-item>
        <div v-if="form.confirmPassword && !confirmPasswordValidation.valid" class="validation-message error">
          {{ confirmPasswordValidation.message }}
        </div>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="w-full"
            :loading="loading"
            :disabled="!isFormValid"
            @click="handleRegister"
          >
             注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="mt-4 text-center">
        <router-link to="/auth/login" class="text-primary hover:underline">
          已有账号？立即登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.register-card {
  width: 384px;
  padding: 32px;
  background-color: #2D2D2D;
  border: 1px solid #3D3D3D;
  border-radius: 8px;
}

.validation-message {
  font-size: 12px;
  margin-top: -8px;
  margin-bottom: 8px;
}

.validation-message.error {
  color: #ef4444;
}

.strength-indicator {
  margin-top: -8px;
  margin-bottom: 16px;
}

.strength-bar {
  height: 4px;
  background-color: #3D3D3D;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-label {
  font-size: 12px;
  margin-top: 4px;
  text-align: right;
}
</style>