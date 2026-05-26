<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElAvatar, ElButton, ElScrollbar } from 'element-plus'
import { DataAnalysis, SwitchButton } from '@element-plus/icons-vue'
import TagSidebar from '@/components/business/TagSidebar.vue'

const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const sidebarWidth = ref(240)
const isResizing = ref(false)
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)

const MIN_SIDEBAR_WIDTH = 60
const MAX_SIDEBAR_WIDTH = 400
const STORAGE_KEY = 'dm-sidebar-width'
const COLLAPSED_KEY = 'dm-sidebar-collapsed'

onMounted(() => {
  const savedWidth = localStorage.getItem(STORAGE_KEY)
  if (savedWidth) {
    sidebarWidth.value = parseInt(savedWidth, 10)
  }

  const savedCollapsed = localStorage.getItem(COLLAPSED_KEY)
  if (savedCollapsed) {
    sidebarCollapsed.value = savedCollapsed === 'true'
  }
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem(COLLAPSED_KEY, String(sidebarCollapsed.value))
}

function startResize(e: MouseEvent) {
  isResizing.value = true
  resizeStartX.value = e.clientX
  resizeStartWidth.value = sidebarWidth.value
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!isResizing.value) return
  const delta = e.clientX - resizeStartX.value
  const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, resizeStartWidth.value + delta))
  sidebarWidth.value = newWidth
}

function stopResize() {
  isResizing.value = false
  localStorage.setItem(STORAGE_KEY, String(sidebarWidth.value))
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

function handleLogout() {
  authStore.logoutAction()
}
</script>

<template>
  <div class="main-layout flex h-screen bg-dark-bg">
    <!-- Sidebar -->
    <aside
      class="sidebar flex flex-col border-r border-dark-border transition-all duration-300"
      :class="{ 'overflow-hidden': sidebarCollapsed }"
      :style="{ width: sidebarCollapsed ? '60px' : `${sidebarWidth}px` }"
    >
      <!-- Toggle Button -->
      <div class="p-2 flex justify-end">
        <el-button
          :icon="sidebarCollapsed ? 'DArrowRight' : 'DArrowLeft'"
          circle
          size="small"
          @click="toggleSidebar"
        />
      </div>

      <!-- User Info -->
      <div v-if="!sidebarCollapsed" class="user-info px-4 py-2">
        <div class="flex items-center gap-3">
          <el-avatar :size="40" class="bg-primary">
            {{ authStore.user?.username?.[0]?.toUpperCase() || 'U' }}
          </el-avatar>
          <div class="user-details overflow-hidden">
            <div class="font-semibold truncate">{{ authStore.user?.username || '用户' }}</div>
            <div class="text-sm text-gray-400 truncate">{{ authStore.user?.email || '' }}</div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <ElScrollbar class="flex-1 overflow-hidden">
        <nav class="py-4">
          <TagSidebar />
        </nav>
      </ElScrollbar>

      <!-- Bottom Actions -->
      <div class="border-t border-dark-border p-2 space-y-2">
        <router-link
          v-if="!sidebarCollapsed"
          to="/statistics"
          class="nav-item flex items-center gap-2 px-4 py-2 rounded hover:bg-dark-card transition-colors"
        >
          <el-icon><DataAnalysis /></el-icon>
          <span>统计数据</span>
        </router-link>
        <button
          v-if="!sidebarCollapsed"
          class="nav-item w-full flex items-center gap-2 px-4 py-2 rounded hover:bg-dark-card transition-colors text-left"
          @click="handleLogout"
        >
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </button>
        <el-button
          v-if="!sidebarCollapsed"
          :icon="'Setting'"
          class="w-full"
          @click="$router.push('/profile')"
        >
          设置
        </el-button>
      </div>

      <!-- Resize Handle -->
      <div
        v-if="!sidebarCollapsed"
        class="resize-handle absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary transition-colors"
        @mousedown="startResize"
      />
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.main-layout {
  background-color: #1A1A1A;
}

.sidebar {
  position: relative;
  background-color: #2D2D2D;
}

.resize-handle {
  z-index: 10;
}

.nav-item {
  color: #E0E0E0;
}

.nav-item:hover {
  color: #409EFF;
}
</style>