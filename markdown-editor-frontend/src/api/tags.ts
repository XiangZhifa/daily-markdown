import request from './request'

export interface Tag {
  id: number
  name: string
  userId?: number
  documentCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface TagCreate {
  name: string
}

export interface TagUpdate {
  name: string
}

export async function getTags(): Promise<Tag[]> {
  return request.get<Tag[]>('/tags') as unknown as Promise<Tag[]>
}

export async function createTag(data: TagCreate): Promise<Tag> {
  return request.post<Tag>('/tags', data) as unknown as Promise<Tag>
}

export async function renameTag(id: number, data: TagUpdate): Promise<Tag> {
  return request.patch<Tag>(`/tags/${id}`, data) as unknown as Promise<Tag>
}

export async function deleteTag(id: number): Promise<void> {
  await request.delete(`/tags/${id}`)
}