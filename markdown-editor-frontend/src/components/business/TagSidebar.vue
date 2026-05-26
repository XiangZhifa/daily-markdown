<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTagsStore } from '@/stores/tags'
import { useDocumentsStore } from '@/stores/documents'
import { Document, ArrowRight, Plus } from '@element-plus/icons-vue'

const tagsStore = useTagsStore()
const documentsStore = useDocumentsStore()

const isCollapsed = ref(false)

onMounted(() => {
  tagsStore.fetchTags()
})

const hasTags = computed(() => tagsStore.tags.length > 0)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function selectTag(tagId: number) {
  documentsStore.setActiveTag(tagId)
}

function clearTagFilter() {
  documentsStore.setActiveTag(null)
}
</script>

<template>
  <div class="tag-sidebar">
    <!-- Header -->
    <div class="tag-header" @click="toggleCollapse">
      <span class="tag-title">标签</span>
      <el-icon class="collapse-icon" :class="{ rotated: isCollapsed }">
        <ArrowRight />
      </el-icon>
    </div>

    <!-- Tag List -->
    <div v-show="!isCollapsed" class="tag-list">
      <!-- No tags state -->
      <div v-if="!hasTags" class="empty-state">
        <span class="empty-text">暂无标签</span>
        <router-link to="/tags" class="add-link">
          <el-icon><Plus /></el-icon>
          添加标签
        </router-link>
      </div>

      <!-- All Documents option -->
      <div
        class="tag-item"
        :class="{ active: documentsStore.activeTagId === null }"
        @click="clearTagFilter"
      >
        <el-icon class="tag-icon"><Document /></el-icon>
        <span class="tag-name">全部文档</span>
      </div>

      <!-- Tag items -->
      <div
        v-for="tag in tagsStore.tags"
        :key="tag.id"
        class="tag-item"
        :class="{ active: documentsStore.activeTagId === tag.id }"
        @click="selectTag(tag.id)"
      >
        <el-icon class="tag-icon"><Document /></el-icon>
        <span class="tag-name">{{ tag.name }}</span>
        <!-- documentCount not available from backend API - graceful degradation -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-sidebar {
  width: 100%;
}

.tag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
}

.tag-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  font-weight: 500;
}

.collapse-icon {
  color: #6b7280;
  transition: transform 0.2s ease;
  width: 16px;
  height: 16px;
}

.collapse-icon.rotated {
  transform: rotate(90deg);
}

.tag-list {
  padding: 0 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #9ca3af;
}

.empty-text {
  font-size: 13px;
}

.add-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #409eff;
  text-decoration: none;
}

.add-link:hover {
  text-decoration: underline;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  color: #d1d5db;
}

.tag-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.tag-item.active {
  background-color: rgba(64, 158, 255, 0.15);
  color: #409eff;
}

.tag-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tag-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-count {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

.tag-item.active .tag-count {
  background-color: rgba(64, 158, 255, 0.2);
  color: #409eff;
}
</style>