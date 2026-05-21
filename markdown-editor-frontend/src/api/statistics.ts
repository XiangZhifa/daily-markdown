import request from './request'

export interface MonthlyStats {
  month: string
  count: number
}

export interface TagStats {
  tagName: string
  count: number
  percentage: number
}

// Statistics API returns data wrapped in {code: 0, data: [...], message: "success"}
// The response interceptor returns response.data (the wrapper), so we need .data to get the actual array
export async function getMonthlyStats(year: number): Promise<MonthlyStats[]> {
  const response: any = await request.get(`/statistics/monthly`, { params: { year } })
  return response.data
}

export async function getTagStats(year: number, month: number): Promise<TagStats[]> {
  const response: any = await request.get(`/statistics/tags`, { params: { year, month } })
  return response.data
}

export async function getYearlyStats(year: number): Promise<MonthlyStats[]> {
  const response: any = await request.get(`/statistics/yearly`, { params: { year } })
  return response.data
}