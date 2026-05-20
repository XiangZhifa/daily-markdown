<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  size: 'md'
})
</script>

<template>
  <div class="loading-spinner" :class="[`size-${size}`]">
    <div class="spinner"></div>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  border-color: var(--accent-color, #00d4ff);
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

.size-sm .spinner {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.size-md .spinner {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.size-lg .spinner {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>