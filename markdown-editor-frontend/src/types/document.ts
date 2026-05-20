import type { Tag } from './tag'

export interface Document {
  id: number
  title: string
  content: string
  userId: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  tags?: Tag[]
}

export interface DocumentCreate {
  title: string
  content: string
  tagIds?: number[]
}

export interface DocumentUpdate {
  title?: string
  content?: string
  tagIds?: number[]
  updatedAt?: string
}