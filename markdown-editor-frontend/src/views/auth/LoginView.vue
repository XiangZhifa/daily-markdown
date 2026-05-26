<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validator } from '@/utils/validator'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)
const rememberMe = ref(false)

// Validation state
const usernameValidation = ref({ valid: true, message: '' })
const passwordValidation = ref({ valid: true, message: '', strength: 0 })

// Load remembered username on mount
onMounted(() => {
  const savedUsername = localStorage.getItem('rememberedUsername')
  if (savedUsername) {
    form.value.username = savedUsername
    rememberMe.value = true
  }
})

// Real-time username validation
function validateUsername() {
  usernameValidation.value = validator.username(form.value.username)
}

// Real-time password validation
function validatePassword() {
  passwordValidation.value = validator.password(form.value.password)
}

// Check if form is valid
const isFormValid = computed(() => {
  return form.value.username.length > 0 &&
    form.value.password.length > 0 &&
    usernameValidation.value.valid &&
    passwordValidation.value.valid
})

async function handleLogin() {
  // Validate before submission
  validateUsername()
  validatePassword()

  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请填写所有字段')
    return
  }

  if (!usernameValidation.value.valid || !passwordValidation.value.valid) {
    return
  }

  loading.value = true
  try {
    await authStore.loginAction(form.value)

    // Handle remember me
    if (rememberMe.value) {
      localStorage.setItem('rememberedUsername', form.value.username)
    } else {
      localStorage.removeItem('rememberedUsername')
    }

    ElMessage.success('登录成功')
    const redirect = route.query.redirect as string
    router.push(redirect || '/documents')
  } catch (error) {
    ElMessage.error('账号或密码错误')
  } finally {
    loading.value = false
  }
}

// Handle Enter key on input
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && isFormValid.value && !loading.value) {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h1 class="text-2xl font-bold mb-2 text-center text-white">墨记</h1>
      <h2 class="text-xl mb-6 text-center text-gray-400">登录</h2>

      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item :error="usernameValidation.message">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            autocomplete="username"
            :class="{ 'input-error': !usernameValidation.valid && form.username }"
            @blur="validateUsername"
            @input="validateUsername"
            @keydown="handleKeydown"
          />
        </el-form-item>

        <el-form-item :error="passwordValidation.message">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            autocomplete="current-password"
            :class="{ 'input-error': !passwordValidation.valid && form.password }"
            @blur="validatePassword"
            @input="validatePassword"
            @keydown="handleKeydown"
          />
        </el-form-item>

        <el-form-item>
          <label class="remember-me-label">
            <el-checkbox v-model="rememberMe" class="remember-checkbox">
              记住我
            </el-checkbox>
          </label>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="w-full login-button"
            :loading="loading"
            :disabled="!isFormValid || loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="mt-4 text-center">
        <router-link to="/auth/register" class="text-primary hover:underline">
          没有账号？立即注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.login-card {
  width: 384px;
  padding: 32px;
  background-color: #2D2D2D;
  border: 1px solid #3D3D3D;
  border-radius: 8px;
}

.login-button {
  height: 44px;
  font-size: 16px;
}

.login-button:not(:disabled):hover {
  opacity: 0.9;
}

.input-error :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #F56C6C inset;
}

.remember-me-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.remember-checkbox {
  color: #909399;
}

.remember-checkbox:hover {
  color: #409EFF;
}

:deep(.el-checkbox__label) {
  color: #909399;
}

:deep(.el-input__wrapper) {
  background-color: #1E1E1E;
  box-shadow: 0 0 0 1px #3D3D3D inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #505050 inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF inset;
}

:deep(.el-input__inner) {
  color: #E5E5E5;
}

:deep(.el-input__inner::placeholder) {
  color: #606266;
}
</style>
