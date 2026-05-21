export interface Tag {
  id: number
  name: string
  color?: string
  userId?: number
  documentCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface TagCreate {
  name: string
}