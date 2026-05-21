<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTagsStore } from '@/stores/tags'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import type { Tag } from '@/api/tags'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const tagsStore = useTagsStore()

// Inline rename state
const editingTagId = ref<number | null>(null)
const editingName = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

// Delete confirmation state
const deletingTag = ref<Tag | null>(null)
const deleteConfirmLoading = ref(false)

// Computed for dialog visibility
const showDeleteDialog = computed({
  get: () => deletingTag.value !== null,
  set: (val: boolean) => { if (!val) deletingTag.value = null }
})

onMounted(() => {
  tagsStore.fetchTags()
})

function startRename(tag: Tag) {
  editingTagId.value = tag.id
  editingName.value = tag.name
  // Focus input on next tick
  setTimeout(() => {
    editInputRef.value?.focus()
    editInputRef.value?.select()
  }, 0)
}

async function saveRename(tag: Tag) {
  const newName = editingName.value.trim()
  if (!newName) {
    ElMessage.warning('Tag name cannot be empty')
    return
  }
  if (newName === tag.name) {
    cancelRename()
    return
  }
  try {
    await tagsStore.renameTag(tag.id, newName)
    ElMessage.success(`Tag renamed to "${newName}"`)
  } catch {
    ElMessage.error(`Failed to rename tag: tag "${newName}" may already exist`)
  } finally {
    cancelRename()
  }
}

function cancelRename() {
  editingTagId.value = null
  editingName.value = ''
}

function handleRenameKeydown(event: KeyboardEvent, tag: Tag) {
  if (event.key === 'Enter') {
    saveRename(tag)
  } else if (event.key === 'Escape') {
    cancelRename()
  }
}

function confirmDelete(tag: Tag) {
  deletingTag.value = tag
}

function cancelDelete() {
  deletingTag.value = null
}

async function executeDelete() {
  if (!deletingTag.value) return
  deleteConfirmLoading.value = true
  try {
    await tagsStore.deleteTag(deletingTag.value.id)
    ElMessage.success(`Tag "${deletingTag.value.name}" deleted`)
    deletingTag.value = null
  } catch {
    ElMessage.error('Failed to delete tag')
  } finally {
    deleteConfirmLoading.value = false
  }
}
</script>

<template>
  <div class="tag-manage p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Manage Tags</h1>
      <el-button @click="tagsStore.fetchTags">
        <el-icon class="mr-1"><Refresh /></el-icon>
        Refresh
      </el-button>
    </div>

    <!-- Loading -->
    <div v-if="tagsStore.loading" class="text-center py-8">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <div v-else-if="tagsStore.tags.length === 0" class="text-center py-8">
      <p class="text-gray-400 mb-4">No tags yet</p>
    </div>

    <!-- Tag List -->
    <div v-else class="space-y-2">
      <div
        v-for="tag in tagsStore.tags"
        :key="tag.id"
        class="tag-item flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <!-- Tag Name -->
        <div class="flex items-center gap-3 flex-1">
          <template v-if="editingTagId === tag.id">
            <el-input
              ref="editInputRef"
              v-model="editingName"
              size="default"
              class="w-48"
              @keydown="handleRenameKeydown($event, tag)"
            />
            <el-button type="primary" size="small" @click="saveRename(tag)">Save</el-button>
            <el-button size="small" @click="cancelRename">Cancel</el-button>
          </template>
          <template v-else>
            <span
              class="text-lg font-medium cursor-pointer hover:text-blue-600"
              @click="startRename(tag)"
            >
              {{ tag.name }}
            </span>
          </template>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <el-button
            v-if="editingTagId !== tag.id"
            type="primary"
            size="small"
            text
            @click="startRename(tag)"
          >
            Rename
          </el-button>
          <el-button
            v-if="editingTagId !== tag.id"
            type="danger"
            size="small"
            text
            @click="confirmDelete(tag)"
          >
            Delete
          </el-button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :model-value="showDeleteDialog"
      title="Confirm Delete"
      :message="deletingTag ? `Delete tag '${deletingTag.name}'? This tag will be removed from all associated documents.` : ''"
      confirm-text="Delete"
      :loading="deleteConfirmLoading"
      @confirm="executeDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.tag-item {
  border-color: var(--el-border-color);
  background: var(--el-bg-color);
}
</style>
