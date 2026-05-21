import request from './request'

export interface MonthlyStats {
  month: string
  count: number
}

export interface TagStats {
  tagId?: number
  tagName: string
  count: number
  percentage?: number
}

export async function getMonthlyStats(year: number): Promise<MonthlyStats[]> {
  return request.get<MonthlyStats[]>(`/statistics/monthly`, { params: { year } }) as unknown as Promise<MonthlyStats[]>
}

export async function getTagStats(year: number, month: number): Promise<TagStats[]> {
  return request.get<TagStats[]>(`/statistics/tags`, { params: { year, month } }) as unknown as Promise<TagStats[]>
}

export async function getYearlyStats(year: number): Promise<MonthlyStats[]> {
  return request.get<MonthlyStats[]>(`/statistics/yearly`, { params: { year } }) as unknown as Promise<MonthlyStats[]>
}