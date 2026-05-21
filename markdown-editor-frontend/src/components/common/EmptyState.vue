<script setup lang="ts">
import { Folder } from '@element-plus/icons-vue'

interface Props {
  title: string
  message: string
  actionText?: string
  actionIcon?: object
}

withDefaults(defineProps<Props>(), {
  actionIcon: () => Folder
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <el-icon class="empty-icon">
      <component :is="actionIcon" />
    </el-icon>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-message">{{ message }}</p>
    <el-button v-if="actionText" type="primary" @click="emit('action')">
      {{ actionText }}
    </el-button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--text-color-secondary, #6b7280);
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-primary, #e5e7eb);
  margin: 0 0 8px 0;
}

.empty-message {
  font-size: 14px;
  color: var(--text-color-secondary, #6b7280);
  margin: 0 0 24px 0;
  max-width: 320px;
}
</style>