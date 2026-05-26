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
    ElMessage.warning('标签名称不能为空')
    return
  }
  if (newName === tag.name) {
    cancelRename()
    return
  }
  try {
    await tagsStore.renameTag(tag.id, newName)
    ElMessage.success(`标签已重命名为 "${newName}"`)
  } catch {
    ElMessage.error(`重命名标签失败: 标签 "${newName}" 可能已存在`)
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
    ElMessage.success(`标签 "${deletingTag.value.name}" 已删除`)
    deletingTag.value = null
  } catch {
    ElMessage.error('删除标签失败')
  } finally {
    deleteConfirmLoading.value = false
  }
}
</script>

<template>
  <div class="tag-manage p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">管理标签</h1>
      <el-button @click="tagsStore.fetchTags">
        <el-icon class="mr-1"><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- Loading -->
    <div v-if="tagsStore.loading" class="text-center py-8">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <div v-else-if="tagsStore.tags.length === 0" class="text-center py-8">
      <p class="text-gray-400 mb-4">暂无标签</p>
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
            <el-button type="primary" size="small" @click="saveRename(tag)">保存</el-button>
            <el-button size="small" @click="cancelRename">取消</el-button>
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
            重命名
          </el-button>
          <el-button
            v-if="editingTagId !== tag.id"
            type="danger"
            size="small"
            text
            @click="confirmDelete(tag)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :model-value="showDeleteDialog"
      title="确认删除"
      :message="deletingTag ? `确定删除标签 '${deletingTag.name}' 吗？该标签将从所有相关文档中移除。` : ''"
      confirm-text="删除"
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
