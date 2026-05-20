import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTags, createTag as apiCreateTag, renameTag as apiRenameTag, deleteTag as apiDeleteTag } from '@/api/tags'
import type { Tag, TagCreate } from '@/api/tags'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const activeTagId = ref<number | null>(null)
  const loading = ref(false)

  async function fetchTags() {
    loading.value = true
    try {
      const data = await getTags()
      tags.value = data
    } finally {
      loading.value = false
    }
  }

  async function createTagAction(name: string) {
    const data: TagCreate = { name }
    const newTag = await apiCreateTag(data)
    tags.value.push(newTag)
    return newTag
  }

  async function renameTagAction(id: number, newName: string) {
    const updated = await apiRenameTag(id, { name: newName })
    const index = tags.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tags.value[index] = updated
    }
    return updated
  }

  async function deleteTagAction(id: number) {
    await apiDeleteTag(id)
    tags.value = tags.value.filter(t => t.id !== id)
    if (activeTagId.value === id) {
      activeTagId.value = null
    }
  }

  function setActiveTag(id: number | null) {
    activeTagId.value = id
  }

  return {
    tags,
    activeTagId,
    loading,
    fetchTags,
    createTag: createTagAction,
    renameTag: renameTagAction,
    deleteTag: deleteTagAction,
    setActiveTag,
  }
})