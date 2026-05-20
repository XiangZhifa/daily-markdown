<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useDocument } from '@/composables/useDocument'
import { useTagsStore } from '@/stores/tags'
import { getDocument, addDocumentTags, removeDocumentTags } from '@/api/documents'
import type { Tag } from '@/types/tag'
import { VMarkdownView as VueMarkdown } from 'vue3-markdown'
import {
  Document as DocIcon,
  Tickets,
  Link as LinkIcon,
  Crop,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const { currentDoc, create, setCurrentDocument } = useDocument()
const tagsStore = useTagsStore()

// Document state
const title = ref('Untitled Document')
const content = ref('')
const selectedTagIds = ref<number[]>([])
const isNew = ref(true)
const docId = ref<number | null>(null)

// UI state
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const showUnsavedDialog = ref(false)
const pendingNavigation = ref<{ path: string } | null>(null)
const splitPosition = ref(50) // percentage
const isDragging = ref(false)

// Resizable split pane
const containerRef = ref<HTMLElement | null>(null)

function startDrag(e: MouseEvent) {
  isDragging.value = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const pos = ((e.clientX - rect.left) / rect.width) * 100
  splitPosition.value = Math.max(20, Math.min(80, pos))
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Load document
onMounted(async () => {
  await tagsStore.fetchTags()
  const id = route.params.id
  if (id && id !== 'new') {
    isNew.value = false
    docId.value = Number(id)
    try {
      const doc = await getDocument(docId.value!)
      title.value = doc.title
      content.value = doc.content
      selectedTagIds.value = doc.tags?.map(t => t.id) || []
      setCurrentDocument(doc)
    } catch {
      router.push('/documents')
    }
  } else {
    isNew.value = true
    docId.value = null
    const newDoc = await create('Untitled Document')
    docId.value = newDoc.id
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})

// Auto-save on content/title change
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
watch([title, content], () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  if (saveStatus.value !== 'saving') {
    saveStatus.value = 'idle'
  }
  autoSaveTimer = setTimeout(() => {
    performAutoSave()
  }, 2000)
})

// Sync tags to backend when they change
let tagSyncTimer: ReturnType<typeof setTimeout> | null = null
watch(selectedTagIds, async (newIds, oldIds) => {
  if (!docId.value || !currentDoc.value) return

  const newSet = new Set(newIds)
  const oldSet = new Set(oldIds || [])

  // Find added and removed tags
  const added = newIds.filter(id => !oldSet.has(id))
  const removed = (oldIds || []).filter(id => !newSet.has(id))

  if (added.length === 0 && removed.length === 0) return

  if (tagSyncTimer) clearTimeout(tagSyncTimer)
  tagSyncTimer = setTimeout(async () => {
    try {
      if (added.length > 0) {
        await addDocumentTags(docId.value!, added)
      }
      if (removed.length > 0) {
        await removeDocumentTags(docId.value!, removed)
      }
    } catch (e) {
      console.error('Failed to sync tags:', e)
    }
  }, 500)
})

async function performAutoSave() {
  if (!docId.value) return
  saveStatus.value = 'saving'
  try {
    const { useDocumentsStore } = await import('@/stores/documents')
    const store = useDocumentsStore()
    await store.updateDoc(docId.value, {
      title: title.value,
      content: content.value,
    })
    saveStatus.value = 'saved'
    setTimeout(() => {
      if (saveStatus.value === 'saved') saveStatus.value = 'idle'
    }, 2000)
  } catch {
    saveStatus.value = 'error'
  }
}

// Manual save with Ctrl+S
async function handleSave() {
  if (!docId.value) return
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  saveStatus.value = 'saving'
  try {
    const { useDocumentsStore } = await import('@/stores/documents')
    const store = useDocumentsStore()
    await store.updateDoc(docId.value, {
      title: title.value,
      content: content.value,
    })
    saveStatus.value = 'saved'
  } catch {
    saveStatus.value = 'error'
  }
}

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 's':
        e.preventDefault()
        handleSave()
        break
      case 'b':
        e.preventDefault()
        insertMarkdown('**', '**', 'bold text')
        break
      case 'i':
        e.preventDefault()
        insertMarkdown('*', '*', 'italic text')
        break
    }
  }
}

// Markdown toolbar helpers
function insertMarkdown(prefix: string, suffix: string, placeholder: string) {
  const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.value.substring(start, end) || placeholder
  content.value = content.value.substring(0, start) + prefix + selected + suffix + content.value.substring(end)
  // Trigger reactivity
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
  }, 0)
}

const toolbarButtons = [
  { icon: 'bold', action: () => insertMarkdown('**', '**', 'bold text'), title: 'Bold (Ctrl+B)' },
  { icon: 'italic', action: () => insertMarkdown('*', '*', 'italic text'), title: 'Italic (Ctrl+I)' },
  { icon: 'document', action: () => insertMarkdown('# ', '', 'Heading'), title: 'Heading' },
  { icon: 'tickets', action: () => insertMarkdown('## ', '', 'Heading'), title: 'Subheading' },
  { icon: 'crop', action: () => insertMarkdown('### ', '', 'Heading'), title: 'Sub-subheading' },
  { icon: 'list', action: () => insertMarkdown('- ', '', 'List item'), title: 'Bullet List' },
  { icon: 'list', action: () => insertMarkdown('1. ', '', 'List item'), title: 'Numbered List' },
  { icon: 'code', action: () => insertMarkdown('`', '`', 'code'), title: 'Inline Code' },
  { icon: 'document', action: () => insertMarkdown('```\n', '\n```', 'code block'), title: 'Code Block' },
  { icon: 'picture', action: () => insertMarkdown('![alt](', ')', 'image-url'), title: 'Image' },
  { icon: 'link', action: () => insertMarkdown('[', '](url)', 'link text'), title: 'Link' },
]

// Icon components map
const iconComponents: Record<string, typeof DocIcon> = {
  bold: DocIcon,
  italic: DocIcon,
  document: DocIcon,
  tickets: Tickets,
  crop: Crop,
  list: DocIcon,
  code: DocIcon,
  link: LinkIcon,
  picture: DocIcon,
}

// Tags autocomplete
const tagInput = ref('')
const tagSuggestions = computed(() => {
  if (!tagInput.value) return tagsStore.tags.slice(0, 10).map(t => ({ value: t }))
  const query = tagInput.value.toLowerCase()
  return tagsStore.tags.filter(t => t.name.toLowerCase().includes(query)).slice(0, 10).map(t => ({ value: t }))
})

function addTag(tag: Tag) {
  if (!selectedTagIds.value.includes(tag.id)) {
    selectedTagIds.value.push(tag.id)
  }
  tagInput.value = ''
}

function removeTag(tagId: number) {
  selectedTagIds.value = selectedTagIds.value.filter(id => id !== tagId)
}

function getTagName(tagId: number): string {
  return tagsStore.tags.find(t => t.id === tagId)?.name || ''
}

// Navigation guard
function confirmNavigation(path: string) {
  if (saveStatus.value === 'saving' || content.value !== currentDoc.value?.content || title.value !== currentDoc.value?.title) {
    pendingNavigation.value = { path }
    showUnsavedDialog.value = true
    return false
  }
  return true
}

function proceedNavigation() {
  if (pendingNavigation.value) {
    router.push(pendingNavigation.value)
  }
  showUnsavedDialog.value = false
  pendingNavigation.value = null
}

function cancelNavigation() {
  showUnsavedDialog.value = false
  pendingNavigation.value = null
}

// Navigation guard for unsaved changes
onBeforeRouteLeave(() => {
  if (saveStatus.value === 'saving') {
    return false
  }
  if (content.value !== currentDoc.value?.content || title.value !== currentDoc.value?.title) {
    return window.confirm('您有未保存的更改，确定要离开吗？')
  }
  return true
})

// Go back
function goBack() {
  if (confirmNavigation('/documents')) {
    router.push('/documents')
  }
}
</script>

<template>
  <div class="editor-container h-screen flex flex-col" tabindex="0" @keydown="handleKeydown">
    <!-- Toolbar -->
    <div class="toolbar p-3 border-b border-dark-border flex justify-between items-center editor-toolbar">
      <div class="flex items-center gap-4">
        <el-button text @click="goBack">← Back</el-button>
        <el-input v-model="title" class="w-64" placeholder="Document title" />
      </div>

      <!-- Markdown Toolbar -->
      <div class="flex gap-1">
        <el-tooltip v-for="(btn, i) in toolbarButtons" :key="i" :content="btn.title" placement="bottom">
          <el-button text class="!px-2" @click="btn.action">
            <el-icon :size="16"><component :is="iconComponents[btn.icon]" /></el-icon>
          </el-button>
        </el-tooltip>
      </div>

      <!-- Status & Save -->
      <div class="flex items-center gap-3">
        <span v-if="saveStatus === 'saving'" class="text-sm text-gray-500">保存中...</span>
        <span v-else-if="saveStatus === 'saved'" class="text-sm text-green-500">已保存</span>
        <span v-else-if="saveStatus === 'error'" class="text-sm text-red-500">保存失败</span>
        <el-button type="primary" @click="handleSave">保存 (Ctrl+S)</el-button>
      </div>
    </div>

    <!-- Tag Input -->
    <div class="px-4 py-2 border-b border-dark-border flex items-center gap-2 flex-wrap">
      <span class="text-sm text-gray-500">标签:</span>
      <el-tag
        v-for="tagId in selectedTagIds"
        :key="tagId"
        closable
        @close="removeTag(tagId)"
        class="mr-1"
      >
        {{ getTagName(tagId) }}
      </el-tag>
      <el-autocomplete
        v-model="tagInput"
        :fetch-suggestions="(_query: string, cb: (opts: {value: Tag}[]) => void) => { cb(tagSuggestions) }"
        placeholder="Add tag..."
        clearable
        value-key="name"
        class="!w-40"
        @select="(item: {value: Tag}) => addTag(item.value)"
      >
        <template #prefix><el-icon><Tickets /></el-icon></template>
      </el-autocomplete>
    </div>

    <!-- Split Editor/Preview -->
    <div ref="containerRef" class="editor-content flex-1 flex overflow-hidden">
      <!-- Editor Pane -->
      <div class="editor-pane flex-1 flex flex-col" :style="{ width: splitPosition + '%' }">
        <el-input
          v-model="content"
          type="textarea"
          class="editor-textarea flex-1"
          placeholder="Start writing in markdown..."
          :rows="30"
        />
      </div>

      <!-- Resizer -->
      <div
        class="resizer w-1 bg-gray-200 hover:bg-primary cursor-col-resize flex-shrink-0 transition-colors"
        :class="{ 'bg-primary': isDragging }"
        @mousedown="startDrag"
      />

      <!-- Preview Pane -->
      <div class="preview-pane flex-1 overflow-auto p-4 preview-area" :style="{ width: (100 - splitPosition) + '%' }">
        <div class="prose max-w-none">
          <VueMarkdown :source="content" />
        </div>
      </div>
    </div>

    <!-- Unsaved Changes Dialog -->
    <el-dialog v-model="showUnsavedDialog" title="未保存的更改" width="400px">
      <p>您有未保存的更改，确定要离开吗？</p>
      <template #footer>
        <el-button @click="cancelNavigation">取消</el-button>
        <el-button type="primary" @click="proceedNavigation">离开</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.editor-container {
  outline: none;
}

.editor-toolbar {
  background-color: var(--bg-primary);
}

.preview-area {
  background-color: var(--bg-primary);
}

.editor-textarea :deep(textarea) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

.resizer {
  user-select: none;
}

.prose {
  color: var(--el-text-color-regular);
}

.prose :deep(h1) {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}

.prose :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.83em 0;
}

.prose :deep(h3) {
  font-size: 1.17em;
  font-weight: bold;
  margin: 1em 0;
}

.prose :deep(pre) {
  background-color: var(--el-fill-color);
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.prose :deep(code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.prose :deep(pre code) {
  background: none;
  padding: 0;
}

.prose :deep(img) {
  max-width: 100%;
}

.prose :deep(a) {
  color: var(--el-color-primary);
}
</style>