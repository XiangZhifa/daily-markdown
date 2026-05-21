<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { useTagsStore } from '@/stores/tags'
import { useRoute, useRouter } from 'vue-router'
import type { Tag } from '@/api/documents'
import { Search, Loading } from '@element-plus/icons-vue'

const documentsStore = useDocumentsStore()
const tagsStore = useTagsStore()
const route = useRoute()
const router = useRouter()

// Search & Filter state
const searchKeyword = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const selectedTags = ref<number[]>([])
const tagMode = ref<'OR' | 'AND'>('OR')
const currentPage = ref(1)
const pageSize = 50

// Multi-select state
const selectedIds = ref<number[]>([])
const showBatchDelete = ref(false)

// Initialize filters from URL query params
onMounted(async () => {
  // First load all tags so we can match by name if needed
  await tagsStore.fetchTags()

  // Read startDate/endDate from URL query params (from statistics drill-down)
  if (route.query.startDate && route.query.endDate) {
    const start = new Date(route.query.startDate as string)
    const end = new Date(route.query.endDate as string)
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      dateRange.value = [start, end]
    }
  }
  // Read tagName from URL query params (from statistics pie chart)
  if (route.query.tagName) {
    const tagName = route.query.tagName as string
    // Find tag by name in the loaded tags
    const match = tagsStore.tags.find(t => t.name === tagName)
    if (match) {
      selectedTags.value = [match.id]
    }
  }
  // Read tagIds from URL query params
  if (route.query.tagIds) {
    const ids = (route.query.tagIds as string).split(',').map(Number).filter(id => !isNaN(id))
    selectedTags.value = ids
  }
  
fetchDocs()
})

// Computed all unique tags from loaded documents
const allTags = computed<{ id: number; name: string }[]>(() => {
  const tagMap = new Map<number, { id: number; name: string }>()
  documentsStore.documents.forEach(doc => {
    doc.tags?.forEach(tag => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag)
      }
    })
  })
  return Array.from(tagMap.values())
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchKeyword, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchDocs()
  }, 300)
})

// Date presets
const datePresets = [
  { label: '今天', getValue: () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return [now, end] as [Date, Date]
  }},
  { label: '最近7天', getValue: () => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const start = new Date()
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    return [start, end] as [Date, Date]
  }},
  { label: '本月', getValue: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    return [start, end] as [Date, Date]
  }},
]

function applyPreset(preset: typeof datePresets[0]) {
  dateRange.value = preset.getValue()
  currentPage.value = 1
  fetchDocs()
}

function clearDateRange() {
  dateRange.value = null
  currentPage.value = 1
  fetchDocs()
}

function fetchDocs() {
  // Sync filters to store
  documentsStore.filters.keyword = searchKeyword.value
  documentsStore.filters.startDate = dateRange.value ? dateRange.value[0].toISOString() : null
  documentsStore.filters.endDate = dateRange.value ? dateRange.value[1].toISOString() : null
  documentsStore.filters.tagIds = selectedTags.value
  documentsStore.filters.tagMode = tagMode.value
  documentsStore.currentPage = currentPage.value
  documentsStore.fetchDocuments()
}

// Tag selection
function toggleTag(tagId: number) {
  const idx = selectedTags.value.indexOf(tagId)
  if (idx === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(idx, 1)
  }
  currentPage.value = 1
  fetchDocs()
}

// Pagination
function loadMore() {
  documentsStore.currentPage++
  documentsStore.loadMore()
}

// Multi-select
function selectAll() {
  if (selectedIds.value.length === documentsStore.documents.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = documentsStore.documents.map(d => d.id)
  }
  showBatchDelete.value = selectedIds.value.length > 0
}

async function batchDelete() {
  if (!confirm(`Delete ${selectedIds.value.length} documents?`)) return
  for (const id of selectedIds.value) {
    await documentsStore.deleteDoc(id)
  }
  selectedIds.value = []
  showBatchDelete.value = false
}

// Card helpers
function getPreview(content: string): string {
  const text = content.replace(/[#*`_\[\]]/g, '').trim()
  return text.length > 80 ? text.substring(0, 80) + '...' : text
}

function getDisplayTags(tags?: Tag[]): Tag[] {
  return tags?.slice(0, 3) || []
}

// Actions
onMounted(() => {
  fetchDocs()
})

function createNew() {
  router.push('/documents/new')
}

function openDocument(id: number) {
  router.push(`/documents/${id}`)
}
</script>

<template>
  <div class="document-list p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">My Documents</h1>
      <el-button type="primary" @click="createNew">+ New Document</el-button>
    </div>

    <!-- Filters -->
    <div class="filter-bar mb-6 space-y-4">
      <!-- Search -->
      <div class="flex gap-4">
        <el-input
          v-model="searchKeyword"
          placeholder="Search by title..."
          clearable
          class="flex-1 max-w-md"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <!-- Date Range -->
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="→"
          start-placeholder="Start date"
          end-placeholder="End date"
          class="!w-auto"
          @change="fetchDocs"
        />
        
        <!-- Date Presets -->
        <div class="flex gap-2">
          <el-button
            v-for="preset in datePresets"
            :key="preset.label"
            size="small"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </el-button>
          <el-button v-if="dateRange" size="small" @click="clearDateRange">
            Clear
          </el-button>
        </div>
      </div>

      <!-- Tags Filter -->
      <div class="flex gap-4 items-center">
        <span class="text-sm text-gray-500">Tags:</span>
        <div class="flex gap-2 flex-wrap">
          <el-tag
            v-for="tag in allTags"
            :key="tag.id"
            :type="selectedTags.includes(tag.id) ? 'primary' : 'info'"
            class="cursor-pointer"
            @click="toggleTag(tag.id)"
          >
            {{ tag.name }}
          </el-tag>
        </div>
        <el-switch
          v-model="tagMode"
          inline-prompt
          active-text="OR"
          inactive-text="AND"
          class="!ml-2"
          @change="fetchDocs"
        />
      </div>
    </div>

    <!-- Batch Actions -->
    <div v-if="showBatchDelete" class="batch-actions mb-4 p-3 bg-red-50 rounded flex items-center justify-between">
      <span class="text-red-600">{{ selectedIds.length }} selected</span>
      <div class="flex gap-2">
        <el-button size="small" @click="selectedIds = []; showBatchDelete = false">
          Cancel
        </el-button>
        <el-button type="danger" size="small" @click="batchDelete">
          Delete Selected
        </el-button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="documentsStore.loading" class="text-center py-8">
      <el-icon class="is-loading text-4xl"><Loading /></el-icon>
    </div>

    <!-- Empty State -->
    <div v-else-if="documentsStore.documents.length === 0" class="text-center py-8">
      <p class="text-gray-400 mb-4">No documents yet</p>
      <el-button type="primary" @click="createNew">创建第一篇文档</el-button>
    </div>

    <!-- Document List -->
    <div v-else>
      <!-- Select All -->
      <div class="mb-2 flex items-center gap-2">
        <el-checkbox
          :model-value="selectedIds.length === documentsStore.documents.length && documentsStore.documents.length > 0"
          @change="selectAll"
        />
        <span class="text-sm text-gray-500">Select all</span>
      </div>

      <div class="grid gap-4">
        <div
          v-for="doc in documentsStore.documents"
          :key="doc.id"
          class="card cursor-pointer hover:border-primary transition-colors relative"
          @click="openDocument(doc.id)"
        >
          <!-- Checkbox -->
          <el-checkbox
            :model-value="selectedIds.includes(doc.id)"
            class="absolute top-4 left-4"
            @change="(val: boolean) => { val ? selectedIds.push(doc.id) : selectedIds.splice(selectedIds.indexOf(doc.id), 1); showBatchDelete = selectedIds.length > 0 }"
            @click.stop
          />

          <!-- Content -->
          <div class="pl-8">
            <h3 class="text-lg font-semibold">{{ doc.title }}</h3>
            
            <!-- Tags -->
            <div v-if="doc.tags?.length" class="flex gap-1 mt-2">
              <el-tag
                v-for="tag in getDisplayTags(doc.tags)"
                :key="tag.id"
                size="small"
                type="info"
              >
                {{ tag.name }}
              </el-tag>
              <el-tag v-if="doc.tags.length > 3" size="small" type="info">
                +{{ doc.tags.length - 3 }}
              </el-tag>
            </div>

            <!-- Preview -->
            <p v-if="doc.content" class="text-gray-400 text-sm mt-2 line-clamp-2">
              {{ getPreview(doc.content) }}
            </p>

            <!-- Meta -->
            <p class="text-gray-500 text-xs mt-2">
              Updated: {{ new Date(doc.updatedAt).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="documentsStore.documents.length >= pageSize" class="text-center mt-6">
        <el-button @click="loadMore">Load More</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>