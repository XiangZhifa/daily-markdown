import request from './request'

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
  content: string
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

export async function getDocuments(params?: {
  keyword?: string
  startDate?: string
  endDate?: string
  tagIds?: string
  page?: number
}): Promise<DocumentListResponse> {
  // Build query params - backend uses startDate/endDate
  const queryParams: Record<string, string | number | undefined> = {}
  if (params?.keyword) queryParams.keyword = params.keyword
  if (params?.startDate) queryParams.startDate = params.startDate
  if (params?.endDate) queryParams.endDate = params.endDate
  if (params?.tagIds) queryParams.tags = params.tagIds
  if (params?.page) queryParams.page = params.page

  // Response interceptor now unwraps {code, data, message} to just data
  const data = await request.get<Document[]>('/documents', { params: queryParams }) as unknown as Document[]
  return {
    data,
    total: data.length,
    page: params?.page || 1,
    hasMore: data.length >= 50
  }
}

export async function searchDocuments(params?: {
  keyword?: string
  startDate?: string
  endDate?: string
  tagIds?: string
  page?: number
}): Promise<DocumentListResponse> {
  // Backend uses same endpoint for search - GET /documents with keyword param
  return getDocuments(params)
}

export async function getDocument(id: number): Promise<Document> {
  return request.get<Document>(`/documents/${id}`) as unknown as Promise<Document>
}

export async function createDocument(data: DocumentCreate): Promise<Document> {
  return request.post<Document>('/documents', data) as unknown as Promise<Document>
}

export async function updateDocument(id: number, data: DocumentUpdate): Promise<Document> {
  return request.patch<Document>(`/documents/${id}`, data) as unknown as Promise<Document>
}

export async function deleteDocument(id: number): Promise<void> {
  await request.delete(`/documents/${id}`)
}

export async function restoreDocument(id: number): Promise<Document> {
  return request.post<Document>(`/documents/${id}/restore`) as unknown as Promise<Document>
}

export async function addDocumentTags(documentId: number, tagIds: number[]): Promise<Document> {
  return request.post<Document>(`/documents/${documentId}/tags`, { tagIds }) as unknown as Promise<Document>
}

export async function removeDocumentTags(documentId: number, tagIds: number[]): Promise<Document> {
  return request.delete<Document>(`/documents/${documentId}/tags`, { data: { tagIds } }) as unknown as Promise<Document>
}