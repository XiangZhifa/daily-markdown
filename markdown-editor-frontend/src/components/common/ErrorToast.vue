<script setup lang="ts">
import { ElMessage } from 'element-plus'

interface ErrorToastOptions {
  message: string
  duration?: number
}

const errorToast = ({ message, duration = 5000 }: ErrorToastOptions) => {
  ElMessage.error({
    message,
    duration,
    customClass: 'error-toast-dark'
  })
}

defineExpose({ errorToast })
</script>

<template>
  <Teleport to="body">
    <div class="error-toast-container"></div>
  </Teleport>
</template>

<style scoped>
.error-toast-container {
  pointer-events: none;
}
</style>