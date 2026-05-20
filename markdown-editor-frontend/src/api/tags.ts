import request from './request'
import type { AxiosResponse } from 'axios'

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
  const response: AxiosResponse<Tag[]> = await request.get('/tags')
  return response.data
}

export async function createTag(data: TagCreate): Promise<Tag> {
  const response: AxiosResponse<Tag> = await request.post('/tags', data)
  return response.data
}

export async function renameTag(id: number, data: TagUpdate): Promise<Tag> {
  const response: AxiosResponse<Tag> = await request.patch(`/tags/${id}`, data)
  return response.data
}

export async function deleteTag(id: number): Promise<void> {
  await request.delete(`/tags/${id}`)
}