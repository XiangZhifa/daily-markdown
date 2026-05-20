import { computed } from 'vue'
import { useTagsStore } from '@/stores/tags'
import type { Tag } from '@/api/tags'

export function useTag() {
  const store = useTagsStore()
  const tags = computed(() => store.tags)

  async function addTag(name: string): Promise<void> {
    await store.createTag(name)
  }

  async function removeTag(id: number): Promise<void> {
    await store.deleteTag(id)
  }

  function searchTags(query: string): Tag[] {
    if (!query.trim()) {
      return tags.value
    }
    const lowerQuery = query.toLowerCase()
    return tags.value.filter(tag => tag.name.toLowerCase().includes(lowerQuery))
  }

  return {
    tags,
    addTag,
    removeTag,
    searchTags,
  }
}
