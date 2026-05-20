<script setup lang="ts">
import { computed } from 'vue'
import type { Document } from '@/types/document'

const props = defineProps<{
  document: Document
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [id: number]
  click: [id: number]
}>()

const displayTags = computed(() => props.document.tags?.slice(0, 3) ?? [])
const remainingCount = computed(() => Math.max(0, (props.document.tags?.length ?? 0) - 3))

const formattedDate = computed(() => {
  const date = new Date(props.document.updatedAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString()
})

const preview = computed(() => {
  const text = (props.document as any).preview ?? props.document.content ?? ''
  return text.length > 80 ? text.slice(0, 80) + '...' : text
})

const handleSelect = () => {
  emit('select', props.document.id)
}

const handleClick = () => {
  emit('click', props.document.id)
}
</script>

<template>
  <div class="document-card" @click="handleClick">
    <div class="checkbox-wrapper" @click.stop>
      <el-checkbox :model-value="selected" @change="handleSelect" />
    </div>

    <div class="content">
      <h3 class="title">{{ document.title }}</h3>

      <div v-if="displayTags.length > 0" class="tags">
        <el-tag v-for="tag in displayTags" :key="tag.id" size="small" effect="plain">
          {{ tag.name }}
        </el-tag>
        <el-tag v-if="remainingCount > 0" size="small" effect="plain" type="info">
          +{{ remainingCount }} more
        </el-tag>
      </div>

      <p class="preview">{{ preview }}</p>

      <span class="date">{{ formattedDate }}</span>
    </div>
  </div>
</template>

<style scoped>
.document-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  border: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

.document-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.content {
  flex: 1;
  min-width: 0;
}

.title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.preview {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  font-size: 12px;
  color: var(--el-text-color-tertiary);
}
</style>