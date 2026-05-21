<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

type ChartType = 'bar' | 'pie'

export interface BarDataPoint {
  month: string
  count: number
}

export interface PieDataPoint {
  name: string
  value: number
}

const props = withDefaults(defineProps<{
  type: ChartType
  data: BarDataPoint[] | PieDataPoint[]
  loading?: boolean
}>(), {
  loading: false
})

const emit = defineEmits<{
  click: [data: BarDataPoint | PieDataPoint]
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const isEmpty = computed(() => !props.loading && (!props.data || props.data.length === 0))

const darkThemeColors = ['#00d4ff', '#00ff88', '#ffcc00', '#ff6b6b', '#a855f7', '#3b82f6', '#ec4899', '#14b8a6']

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value, 'dark')
  updateChart()

  chartInstance.on('click', (params: echarts.ECElementEvent) => {
    if (params.data) {
      emit('click', params.data as BarDataPoint | PieDataPoint)
    }
  })
}

function updateChart() {
  if (!chartInstance || props.loading) return

  if (props.type === 'bar') {
    const barData = props.data as BarDataPoint[]
    chartInstance.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17, 17, 17, 0.9)',
        borderColor: '#333',
        textStyle: { color: '#fff' }
      },
      grid: {
        left: '10%',
        right: '5%',
        bottom: '15%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: barData.map(d => d.month),
        axisLine: { lineStyle: { color: '#444' } },
        axisLabel: { color: '#888' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#444' } },
        axisLabel: { color: '#888' },
        splitLine: { lineStyle: { color: '#333' } }
      },
      series: [{
        type: 'bar',
        data: barData.map(d => d.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00d4ff' },
            { offset: 1, color: '#0066ff' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 212, 255, 0.5)'
          }
        }
      }]
    })
  } else {
    const pieData = props.data as PieDataPoint[]
    chartInstance.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(17, 17, 17, 0.9)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#888' }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        data: pieData,
        itemStyle: {
          borderRadius: 6,
          color: (params: { dataIndex: number }) => darkThemeColors[params.dataIndex % darkThemeColors.length]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          scale: true,
          scaleSize: 10
        },
        label: {
          color: '#888',
          formatter: '{b}: {c}'
        }
      }]
    })
  }
}

function resizeChart() {
  chartInstance?.resize()
}

watch(() => props.data, updateChart, { deep: true })
watch(() => props.loading, () => {
  if (props.loading) {
    chartInstance?.showLoading({
      color: '#00d4ff',
      maskColor: 'rgba(0, 0, 0, 0.5)'
    })
  } else {
    chartInstance?.hideLoading()
    updateChart()
  }
})

onMounted(async () => {
  await nextTick()
  initChart()
  window.addEventListener('resize', resizeChart)
})

defineExpose({
  resizeChart
})
</script>

<template>
  <div class="statistics-chart relative">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-base-100/50 z-10">
      <span class="text-primary">Loading...</span>
    </div>

    <div v-if="isEmpty" class="absolute inset-0 flex items-center justify-center">
      <span class="text-gray-500">No data available</span>
    </div>

    <div ref="chartRef" class="w-full h-full" :class="{ 'opacity-0': isEmpty && !loading }"></div>
  </div>
</template>

<style scoped>
.statistics-chart {
  min-height: 300px;
}
</style>