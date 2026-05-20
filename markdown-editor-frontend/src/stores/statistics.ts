import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMonthlyStats, getTagStats } from '@/api/statistics'
import type { MonthlyStats, TagStats } from '@/api/statistics'

export const useStatisticsStore = defineStore('statistics', () => {
  const monthlyData = ref<MonthlyStats[]>([])
  const tagData = ref<TagStats[]>([])
  const currentMonth = ref<string>('')
  const currentYear = ref<number>(new Date().getFullYear())
  const loading = ref(false)

  async function fetchMonthlyStats(year: number) {
    loading.value = true
    try {
      const data = await getMonthlyStats(year)
      monthlyData.value = data
      currentYear.value = year
    } finally {
      loading.value = false
    }
  }

  async function fetchTagStats(year: number, month: number) {
    loading.value = true
    try {
      const data = await getTagStats(year, month)
      tagData.value = data
      currentYear.value = year
      currentMonth.value = String(month)
    } finally {
      loading.value = false
    }
  }

  function setMonth(month: string) {
    currentMonth.value = month
  }

  function setYear(year: number) {
    currentYear.value = year
  }

  return {
    monthlyData,
    tagData,
    currentMonth,
    currentYear,
    loading,
    fetchMonthlyStats,
    fetchTagStats,
    setMonth,
    setYear,
  }
})