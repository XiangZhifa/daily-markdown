<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Folder } from '@element-plus/icons-vue'
import { useStatisticsStore } from '@/stores/statistics'
import StatisticsChart from '@/components/business/StatisticsChart.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { BarDataPoint, PieDataPoint } from '@/components/business'

const router = useRouter()
const statisticsStore = useStatisticsStore()

const currentYear = ref(new Date().getFullYear())
const currentMonthIndex = ref(new Date().getMonth()) // 0-11

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const selectedMonth = computed(() => {
  return `${currentYear.value}-${String(currentMonthIndex.value + 1).padStart(2, '0')}`
})

const displayMonth = computed(() => {
  return `${currentYear.value}年${monthNames[currentMonthIndex.value]}`
})

const years = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => current - i)
})

const chartLoading = ref(false)

const barData = computed<BarDataPoint[]>(() => {
  return statisticsStore.monthlyData.map(item => ({
    month: item.month,
    count: item.count
  }))
})

const pieData = computed<PieDataPoint[]>(() => {
  return statisticsStore.tagData.map(item => ({
    name: item.tagName,
    value: item.count
  }))
})

const isEmpty = computed(() => {
  return !chartLoading.value && barData.value.length === 0 && pieData.value.length === 0
})

async function loadData() {
  chartLoading.value = true
  try {
    await Promise.all([
      statisticsStore.fetchMonthlyStats(currentYear.value),
      statisticsStore.fetchTagStats(currentYear.value, currentMonthIndex.value + 1)
    ])
  } finally {
    chartLoading.value = false
  }
}

function prevMonth() {
  if (currentMonthIndex.value === 0) {
    currentMonthIndex.value = 11
    currentYear.value--
  } else {
    currentMonthIndex.value--
  }
}

function nextMonth() {
  if (currentMonthIndex.value === 11) {
    currentMonthIndex.value = 0
    currentYear.value++
  } else {
    currentMonthIndex.value++
  }
}

function onBarClick(data: BarDataPoint | PieDataPoint) {
  const barPoint = data as BarDataPoint
  // Navigate to document list filtered by the clicked month
  // Format: YYYY-MM
  const [year, month] = barPoint.month.split('-')
  const startDate = `${year}-${month}-01`
  const endDate = `${year}-${month}-31`
  router.push({
    path: '/documents',
    query: { startDate, endDate }
  })
}

function onPieClick(data: BarDataPoint | PieDataPoint) {
  const piePoint = data as PieDataPoint
  // Find tag by name and navigate with tag filter
  // For now, navigate with tag name as query (the documents store will need to handle this)
  router.push({
    path: '/documents',
    query: { tagName: piePoint.name }
  })
}

watch([currentYear], () => {
  // Year changed - update both bar chart and pie chart
  statisticsStore.setYear(currentYear.value)
  statisticsStore.fetchMonthlyStats(currentYear.value)
  statisticsStore.fetchTagStats(currentYear.value, currentMonthIndex.value + 1)
})

watch([currentMonthIndex], () => {
  // Only month changed - update pie chart only (bar chart shows yearly data)
  statisticsStore.setMonth(selectedMonth.value)
  statisticsStore.fetchTagStats(currentYear.value, currentMonthIndex.value + 1)
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="statistics-view p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">统计数据</h1>
      
      <!-- Month/Year Navigation -->
      <div class="flex items-center gap-4">
        <el-button
          text
          circle
          size="small"
          @click="prevMonth"
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </el-button>
        
        <div class="flex items-center gap-2">
          <el-select
            v-model="currentYear"
            size="small"
            class="w-24"
          >
            <el-option v-for="year in years" :key="year" :value="year" :label="`${year}年`" />
          </el-select>
          
          <el-select
            v-model="currentMonthIndex"
            size="small"
            class="w-20"
          >
            <el-option v-for="(name, index) in monthNames" :key="index" :value="index" :label="name" />
          </el-select>
        </div>
        
        <el-button
          text
          circle
          size="small"
          @click="nextMonth"
          aria-label="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </el-button>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Monthly Bar Chart -->
      <div class="chart-card">
        <div class="chart-card-body">
          <h2 class="chart-title mb-2">月度文档</h2>
          <p class="chart-subtitle mb-4">{{ currentYear }}年文章统计</p>
          <div class="h-80">
            <StatisticsChart
              :type="'bar'"
              :data="barData"
              :loading="chartLoading"
              @click="onBarClick"
            />
          </div>
        </div>
      </div>

      <!-- Tag Distribution Pie Chart -->
      <div class="chart-card">
        <div class="chart-card-body">
          <h2 class="chart-title mb-2">标签分布</h2>
          <p class="chart-subtitle mb-4">{{ displayMonth }}标签统计</p>
          <div class="h-80">
            <StatisticsChart
              :type="'pie'"
              :data="pieData"
              :loading="chartLoading"
              @click="onPieClick"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-if="isEmpty"
      title="本月暂无文章"
      message="开始创作以查看统计数据"
      action-text="创建文档"
      :action-icon="Folder"
      @action="$router.push('/documents/new')"
    />
  </div>
</template>

<style scoped>
.statistics-view {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.chart-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
}

.chart-card-body {
  padding: 0;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.chart-subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

</style>