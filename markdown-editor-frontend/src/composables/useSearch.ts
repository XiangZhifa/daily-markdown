import { ref } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { getDocuments } from '@/api/documents'
import type { Document } from '@/api/documents'

export interface SearchFilters {
  keyword: string
  dateRange: [Date, Date] | null
  selectedTags: number[]
}

export function useSearch() {
  const store = useDocumentsStore()
  const keyword = ref<string>('')
  const dateRange = ref<[Date, Date] | null>(null)
  const selectedTags = ref<number[]>([])
  const searchTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

  function search(): void {
    if (searchTimeoutId.value) {
      clearTimeout(searchTimeoutId.value)
    }
    searchTimeoutId.value = setTimeout(() => {
      performSearch()
    }, 300)
  }

  async function performSearch(): Promise<Document[]> {
    const params: {
      keyword?: string
      startDate?: string
      endDate?: string
      tags?: string
    } = {}

    if (keyword.value) {
      params.keyword = keyword.value
    }
    if (dateRange.value) {
      params.startDate = dateRange.value[0].toISOString()
      params.endDate = dateRange.value[1].toISOString()
    }
    if (selectedTags.value.length > 0) {
      params.tags = selectedTags.value.join(',')
    }

    // Use API directly for search and update store
    const results = await getDocuments(params)
    store.documents = results.data
    return results.data
  }

  function clearFilters(): void {
    keyword.value = ''
    dateRange.value = null
    selectedTags.value = []
  }

  return {
    keyword,
    dateRange,
    selectedTags,
    search,
    clearFilters,
  }
}
