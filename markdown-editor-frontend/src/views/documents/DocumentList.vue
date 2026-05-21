<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { useTagsStore } from '@/stores/tags'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import DocumentCard from '@/components/business/DocumentCard.vue'

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
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="documentsStore.documents.length === 0"
      title="No documents yet"
      message="Create your first document to get started."
      action-text="创建第一篇文档"
      @action="createNew"
    />

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
        <DocumentCard
          v-for="doc in documentsStore.documents"
          :key="doc.id"
          :document="doc"
          :selected="selectedIds.includes(doc.id)"
          @select="(id: number) => { const idx = selectedIds.indexOf(id); if (idx === -1) { selectedIds.push(id) } else { selectedIds.splice(idx, 1) }; showBatchDelete = selectedIds.length > 0 }"
          @click="openDocument"
        />
      </div>

      <!-- Load More -->
      <div v-if="documentsStore.documents.length >= pageSize" class="text-center mt-6">
        <el-button @click="loadMore">Load More</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>