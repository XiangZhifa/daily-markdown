import { ref, watch } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import type { Document, DocumentCreate, DocumentUpdate } from '@/api/documents'

export function useDocument() {
  const store = useDocumentsStore()
  const currentDoc = ref<Document | null>(store.currentDocument)
  const saveTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

  // Sync with store
  watch(() => store.currentDocument, (newDoc) => {
    currentDoc.value = newDoc
  })

  function debouncedAutoSave(doc: Document, delay = 2000): void {
    if (saveTimeoutId.value) {
      clearTimeout(saveTimeoutId.value)
    }
    saveTimeoutId.value = setTimeout(() => {
      save(doc)
    }, delay)
  }

  async function create(title?: string): Promise<Document> {
    const data: DocumentCreate = { title: title || '无标题', content: '' }
    const doc = await store.createDoc(data)
    currentDoc.value = doc
    return doc
  }

  async function save(doc: Document): Promise<void> {
    const updateData: DocumentUpdate = {
      title: doc.title,
      content: doc.content,
    }
    await store.updateDoc(doc.id, updateData)
  }

  async function remove(id: number): Promise<void> {
    await store.deleteDoc(id)
    if (currentDoc.value?.id === id) {
      currentDoc.value = null
    }
  }

  function setCurrentDocument(doc: Document | null): void {
    store.setCurrentDocument(doc)
    currentDoc.value = doc
  }

  function triggerAutoSave(): void {
    if (currentDoc.value) {
      debouncedAutoSave(currentDoc.value)
    }
  }

  return {
    currentDoc,
    create,
    save,
    delete: remove,
    setCurrentDocument,
    triggerAutoSave,
  }
}
