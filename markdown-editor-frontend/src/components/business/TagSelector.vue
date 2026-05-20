<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTagsStore } from '@/stores/tags'
import type { Tag } from '@/types/tag'

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [tagIds: number[]]
}>()

const tagsStore = useTagsStore()

const inputValue = ref('')
const showDropdown = ref(false)
const createLoading = ref(false)

const filteredTags = computed(() => {
  if (!inputValue.value) {
    return tagsStore.tags.slice(0, 10)
  }
  const query = inputValue.value.toLowerCase()
  return tagsStore.tags
    .filter(t => t.name.toLowerCase().includes(query))
    .slice(0, 10)
})

const showCreateOption = computed(() => {
  if (!inputValue.value) return false
  const query = inputValue.value.toLowerCase()
  return !tagsStore.tags.some(t => t.name.toLowerCase() === query)
})

function handleSelect(tag: Tag) {
  if (props.modelValue.length >= 20) return
  if (!props.modelValue.includes(tag.id)) {
    emit('update:modelValue', [...props.modelValue, tag.id])
  }
  inputValue.value = ''
  showDropdown.value = false
}

function handleRemove(tagId: number) {
  emit('update:modelValue', props.modelValue.filter(id => id !== tagId))
}

async function handleCreateTag() {
  if (!inputValue.value.trim()) return
  if (props.modelValue.length >= 20) return

  createLoading.value = true
  try {
    const newTag = await tagsStore.createTag(inputValue.value.trim())
    emit('update:modelValue', [...props.modelValue, newTag.id])
    inputValue.value = ''
    showDropdown.value = false
  } finally {
    createLoading.value = false
  }
}

function handleFocus() {
  showDropdown.value = true
}

function handleInput(value: string) {
  inputValue.value = value
  showDropdown.value = true
}

function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && showCreateOption.value) {
    e.preventDefault()
    handleCreateTag()
  }
}

function getTagName(tagId: number): string {
  return tagsStore.tags.find(t => t.id === tagId)?.name || ''
}
</script>

<template>
  <div class="tag-selector">
    <!-- Selected Tags Badges -->
    <div class="selected-tags flex flex-wrap gap-1 mb-2">
      <el-tag
        v-for="tagId in modelValue"
        :key="tagId"
        closable
        @close="handleRemove(tagId)"
      >
        {{ getTagName(tagId) }}
      </el-tag>
    </div>

    <!-- Input with Autocomplete -->
    <div class="relative">
      <el-input
        :model-value="inputValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        placeholder="Search or create tag..."
        :disabled="modelValue.length >= 20"
        clearable
        class="w-full"
      >
        <template #prefix>
          <el-icon><Tickets /></el-icon>
        </template>
      </el-input>

      <!-- Dropdown -->
      <div
        v-if="showDropdown && (filteredTags.length > 0 || showCreateOption)"
        class="absolute z-50 w-full mt-1 bg-base-100 border border-dark-border rounded shadow-lg max-h-60 overflow-auto"
      >
        <!-- Existing Tags -->
        <div
          v-for="tag in filteredTags"
          :key="tag.id"
          class="px-3 py-2 cursor-pointer hover:bg-base-200 transition-colors"
          @click="handleSelect(tag)"
        >
          {{ tag.name }}
        </div>

        <!-- Create New Tag Option -->
        <div
          v-if="showCreateOption"
          class="px-3 py-2 cursor-pointer hover:bg-base-200 transition-colors border-t border-dark-border text-primary"
          @click="handleCreateTag"
        >
          <span v-if="createLoading">Creating...</span>
          <span v-else>Create "{{ inputValue }}"</span>
        </div>
      </div>
    </div>

    <!-- Max tags hint -->
    <div v-if="modelValue.length >= 20" class="text-xs text-gray-500 mt-1">
      Maximum 20 tags reached
    </div>
  </div>
</template>

<script lang="ts">
import { Tickets } from '@element-plus/icons-vue'
export default {
  components: { Tickets }
}
</script>

<style scoped>
.tag-selector {
  @apply relative;
}

.selected-tags :deep(.el-tag) {
  @apply mr-1 mb-1;
}
</style>