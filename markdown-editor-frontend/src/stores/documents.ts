import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/api/documents'
import type { Document, DocumentCreate, DocumentUpdate } from '@/api/documents'

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>([])
  const currentDocument = ref<Document | null>(null)
  const loading = ref(false)

  // Filter state
  const filters = ref({
    keyword: '',
    startDate: null as string | null,
    endDate: null as string | null,
    tagIds: [] as number[],
    tagMode: 'OR' as 'OR' | 'AND',
  })

  // Active tag for sidebar filtering
  const activeTagId = ref<number | null>(null)

  // Pagination state
  const currentPage = ref(1)
  const pageSize = ref(50)
  const total = ref(0)
  const hasMore = computed(() => documents.value.length < total.value)

  function setFilter<K extends keyof typeof filters.value>(key: K, value: typeof filters.value[K]) {
    filters.value[key] = value
    if (key !== 'keyword' || !value) {
      currentPage.value = 1
      fetchDocuments()
    }
  }

  function setActiveTag(tagId: number | null) {
    activeTagId.value = tagId
    if (tagId !== null) {
      filters.value.tagIds = [tagId]
    } else {
      filters.value.tagIds = []
    }
    currentPage.value = 1
    fetchDocuments()
  }

  function clearFilters() {
    filters.value = {
      keyword: '',
      startDate: null,
      endDate: null,
      tagIds: [],
      tagMode: 'OR',
    }
    currentPage.value = 1
    fetchDocuments()
  }

  async function fetchDocuments() {
    loading.value = true
    try {
      const params: {
        page: number
        pageSize: number
        keyword?: string
        startDate?: string
        endDate?: string
        tagIds?: string
      } = {
        page: currentPage.value,
        pageSize: pageSize.value,
      }
      if (filters.value.keyword) params.keyword = filters.value.keyword
      if (filters.value.startDate) params.startDate = filters.value.startDate
      if (filters.value.endDate) params.endDate = filters.value.endDate
      if (filters.value.tagIds.length) params.tagIds = filters.value.tagIds.join(',')
      const response = await getDocuments(params)
      documents.value = response.data
      total.value = response.total
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (hasMore.value && !loading.value) {
      currentPage.value++
      loading.value = true
      try {
        const params: {
          page: number
          pageSize: number
          keyword?: string
          startDate?: string
          endDate?: string
          tagIds?: string
        } = {
          page: currentPage.value,
          pageSize: pageSize.value,
        }
        if (filters.value.keyword) params.keyword = filters.value.keyword
        if (filters.value.startDate) params.startDate = filters.value.startDate
        if (filters.value.endDate) params.endDate = filters.value.endDate
        if (filters.value.tagIds.length) params.tagIds = filters.value.tagIds.join(',')
        const response = await getDocuments(params)
        documents.value.push(...response.data)
        total.value = response.total
      } finally {
        loading.value = false
      }
    }
  }

  async function createDoc(data: DocumentCreate) {
    const doc = await createDocument(data)
    documents.value.unshift(doc)
    return doc
  }

  async function updateDoc(id: number, data: DocumentUpdate) {
    const updated = await updateDocument(id, data)
    const index = documents.value.findIndex(d => d.id === id)
    if (index !== -1) {
      documents.value[index] = updated
    }
    if (currentDocument.value?.id === id) {
      currentDocument.value = updated
    }
    return updated
  }

  async function deleteDoc(id: number) {
    await deleteDocument(id)
    documents.value = documents.value.filter(d => d.id !== id)
    if (currentDocument.value?.id === id) {
      currentDocument.value = null
    }
  }

  function setCurrentDocument(doc: Document | null) {
    currentDocument.value = doc
  }

  return {
    documents,
    currentDocument,
    loading,
    filters,
    activeTagId,
    currentPage,
    hasMore,
    fetchDocuments,
    setFilter,
    setActiveTag,
    clearFilters,
    loadMore,
    createDoc,
    updateDoc,
    deleteDoc,
    setCurrentDocument,
  }
})