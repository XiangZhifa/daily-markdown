import request from './request'
import type { AxiosResponse } from 'axios'

export interface MonthlyStats {
  month: string
  count: number
}

export interface TagStats {
  tagName: string
  count: number
  percentage: number
}

export async function getMonthlyStats(year: number): Promise<MonthlyStats[]> {
  const response: AxiosResponse<MonthlyStats[]> = await request.get(`/statistics/monthly`, {
    params: { year }
  })
  return response.data
}

export async function getTagStats(year: number, month: number): Promise<TagStats[]> {
  const response: AxiosResponse<TagStats[]> = await request.get(`/statistics/tags`, {
    params: { year, month }
  })
  return response.data
}

export async function getYearlyStats(year: number): Promise<MonthlyStats[]> {
  const response: AxiosResponse<MonthlyStats[]> = await request.get(`/statistics/yearly`, {
    params: { year }
  })
  return response.data
}