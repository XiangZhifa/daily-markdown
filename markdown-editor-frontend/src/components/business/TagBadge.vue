<script setup lang="ts">
const props = defineProps<{
  name: string
  count?: number
  removable?: boolean
}>()

const emit = defineEmits<{
  filter: [name: string]
  remove: [name: string]
}>()

const handleClick = () => {
  emit('filter', props.name)
}

const handleRemove = (event: Event) => {
  event.stopPropagation()
  emit('remove', props.name)
}
</script>

<template>
  <el-tag
    class="tag-badge"
    size="small"
    effect="plain"
    :closable="removable"
    :disable-transitions="true"
    @click="handleClick"
    @close="handleRemove"
  >
    {{ name }}
    <span v-if="count !== undefined" class="count">({{ count }})</span>
  </el-tag>
</template>

<style scoped>
.tag-badge {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  font-weight: 500;
}

.tag-badge:hover {
  background-color: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
}

.tag-badge .count {
  margin-left: 2px;
  font-size: 11px;
  opacity: 0.7;
}

.tag-badge .el-tag__close {
  margin-left: 4px;
  margin-right: -2px;
}

.tag-badge .el-tag__close:hover {
  background-color: var(--el-color-primary);
  color: var(--el-bg-color);
}
</style>
