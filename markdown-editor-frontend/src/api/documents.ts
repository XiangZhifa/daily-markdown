import request from './request'
import type { AxiosResponse } from 'axios'

export interface Document {
  id: number
  title: string
  content: string
  userId: number
  createdAt: string
  updatedAt: string
  tags?: Tag[]
}

export interface DocumentCreate {
  title: string
  content?: string
}

export interface DocumentUpdate {
  title?: string
  content?: string
}

export interface Tag {
  id: number
  name: string
}

export interface DocumentListResponse {
  data: Document[]
  total: number
  page: number
  hasMore: boolean
}

// Backend returns: { code: number, data: Document[], message: string }
// After response interceptor, request.get() returns { code, data, message } directly
// So response IS the unwrapped data
export async function getDocuments(params?: {
  keyword?: string
  startDate?: string
  endDate?: string
  tagIds?: string
  page?: number
}): Promise<{ data: Document[], total: number, page: number, hasMore: boolean }> {
  // Build query params - backend uses startDate/endDate
  const queryParams: Record<string, string | number | undefined> = {}
  if (params?.keyword) queryParams.keyword = params.keyword
  if (params?.startDate) queryParams.startDate = params.startDate
  if (params?.endDate) queryParams.endDate = params.endDate
  if (params?.tagIds) queryParams.tags = params.tagIds
  if (params?.page) queryParams.page = params.page

  // response is already unwrapped: { code, data: Document[], message }
  const response = await request.get('/documents', { params: queryParams })
  return {
    data: response.data as Document[],
    total: (response.data as Document[]).length,
    page: params?.page || 1,
    hasMore: (response.data as Document[]).length >= 50
  }
}

export async function searchDocuments(params?: {
  keyword?: string
  startDate?: string
  endDate?: string
  tagIds?: string
  page?: number
}): Promise<{ data: Document[], total: number, page: number, hasMore: boolean }> {
  // Backend uses same endpoint for search - GET /documents with keyword param
  return getDocuments(params)
}

export async function getDocument(id: number): Promise<Document> {
  const response: AxiosResponse<Document> = await request.get(`/documents/${id}`)
  return response.data
}

export async function createDocument(data: DocumentCreate): Promise<Document> {
  const response: AxiosResponse<Document> = await request.post('/documents', data)
  return response.data
}

export async function updateDocument(id: number, data: DocumentUpdate): Promise<Document> {
  const response: AxiosResponse<Document> = await request.patch(`/documents/${id}`, data)
  return response.data
}

export async function deleteDocument(id: number): Promise<void> {
  await request.delete(`/documents/${id}`)
}

export async function restoreDocument(id: number): Promise<Document> {
  const response: AxiosResponse<Document> = await request.post(`/documents/${id}/restore`)
  return response.data
}

export async function addDocumentTags(documentId: number, tagIds: number[]): Promise<Document> {
  const response: AxiosResponse<Document> = await request.post(`/documents/${documentId}/tags`, { tagIds })
  return response.data
}

export async function removeDocumentTags(documentId: number, tagIds: number[]): Promise<Document> {
  const response: AxiosResponse<Document> = await request.delete(`/documents/${documentId}/tags`, { data: { tagIds } })
  return response.data
}