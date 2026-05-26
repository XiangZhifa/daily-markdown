<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import { ElMessage } from 'element-plus'

// Error boundary to catch component errors
onErrorCaptured((err, _instance, info) => {
  console.error('Component error:', err, info)
  ElMessage.error('发生错误，请重试。')
  return false
})
</script>

<template>
  <div class="app-container dark">
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<style>
:root {
  --bg-primary: #1A1A1A;
  --bg-secondary: #2D2D2D;
  --text-primary: #FFFFFF;
  --text-secondary: #A0A0A0;
  --accent-color: #00d4ff;
}

.app-container {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>