<script setup lang="ts">
interface Props {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <ElDialog
    :model-value="true"
    :title="title"
    width="400px"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="emit('cancel')"
    class="confirm-dialog"
  >
    <p class="message">{{ message }}</p>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="emit('cancel')">{{ cancelText }}</ElButton>
        <ElButton type="primary" @click="emit('confirm')">{{ confirmText }}</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.message {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: var(--text-secondary, #a0a0a0);
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>