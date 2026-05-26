<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { updatePassword } from '@/api/profile'
import { validator } from '@/utils/validator'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const profileLoading = ref(false)

onMounted(async () => {
  profileLoading.value = true
  try {
    await authStore.fetchProfile()
  } catch (error) {
    console.error('获取用户资料失败:', error)
  } finally {
    profileLoading.value = false
  }
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Password strength tracking
const newPasswordStrength = computed(() => validator.password(passwordForm.value.newPassword))

// Form validation rules
const rules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码至少8个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// Check if form is valid (all fields filled and passwords match)
const isFormValid = computed(() => {
  return passwordForm.value.oldPassword.length > 0 &&
    passwordForm.value.newPassword.length > 0 &&
    passwordForm.value.confirmPassword.length > 0 &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
    newPasswordStrength.value.valid
})

// Strength label and color
const strengthLabel = computed(() => {
  const s = newPasswordStrength.value.strength
  if (s === 0) return ''
  if (s === 1) return '弱'
  if (s === 2) return '中等'
  if (s === 3) return '良好'
  return '强'
})

const strengthColor = computed(() => {
  const s = newPasswordStrength.value.strength
  if (s <= 1) return '#F56C6C' // red
  if (s === 2) return '#E6A23C' // orange
  if (s === 3) return '#409EFF' // blue
  return '#67C23A' // green
})

async function handleUpdatePassword() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await updatePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword)
      ElMessage.success('密码修改成功')
      // Reset form
      passwordForm.value.oldPassword = ''
      passwordForm.value.newPassword = ''
      passwordForm.value.confirmPassword = ''
      formRef.value?.resetFields()
    } catch (error: any) {
      const message = error?.response?.data?.message || ''
      if (message.includes('wrong') || message.includes('incorrect') || message.includes('错误')) {
        ElMessage.error('当前密码错误')
      } else {
        ElMessage.error('密码修改失败')
      }
    } finally {
      loading.value = false
    }
  })
}

// Format date for display
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="profile-view">
    <h1 class="text-2xl font-bold mb-6 text-white">个人资料</h1>

    <!-- User Info Card -->
    <div class="card max-w-lg mb-6">
      <h2 class="text-lg font-semibold mb-4 text-white">基本信息</h2>
      <div class="space-y-4">
        <div class="info-row">
          <span class="info-label">用户名</span>
          <span class="info-value">{{ authStore.user?.username || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">邮箱</span>
          <span class="info-value">{{ authStore.user?.email || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">注册时间</span>
          <span class="info-value">{{ formatDate(authStore.user?.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Password Change Card -->
    <div class="card max-w-lg">
      <h2 class="text-lg font-semibold mb-4 text-white">修改密码</h2>
      <el-form
        ref="formRef"
        :model="passwordForm"
        :rules="rules"
        label-width="100px"
        @submit.prevent="handleUpdatePassword"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
          <!-- Password Strength Indicator -->
          <div v-if="passwordForm.newPassword" class="strength-indicator">
            <div class="strength-bars">
              <div
                v-for="i in 4"
                :key="i"
                class="strength-bar"
                :class="{ active: i <= newPasswordStrength.strength }"
                :style="{ backgroundColor: i <= newPasswordStrength.strength ? strengthColor : '#3D3D3D' }"
              />
            </div>
            <span class="strength-label" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
          </div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!isFormValid || loading"
            @click="handleUpdatePassword"
          >
            {{ loading ? '保存中...' : '保存' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  padding: 24px;
}

.card {
  background-color: #2D2D2D;
  border: 1px solid #3D3D3D;
  border-radius: 8px;
  padding: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #3D3D3D;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 100px;
  color: #909399;
  font-size: 14px;
}

.info-value {
  color: #E5E5E5;
  font-size: 14px;
}

.strength-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.strength-bars {
  display: flex;
  gap: 4px;
}

.strength-bar {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background-color: #3D3D3D;
  transition: background-color 0.3s;
}

.strength-label {
  font-size: 12px;
  transition: color 0.3s;
}

/* Element Plus form overrides for dark theme */
:deep(.el-form-item__label) {
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

:deep(.el-form-item__error) {
  color: #F56C6C;
}
</style>