import type { UserProfile } from './api'
import type { Document } from './document'
import type { Tag } from './tag'

export interface AuthState {
  token: string | null
  user: UserProfile | null
  isAuthenticated: boolean
}

export interface DocumentState {
  documents: Document[]
  currentDocument: Document | null
  isLoading: boolean
}

export interface TagState {
  tags: Tag[]
}

export interface StatisticsState {
  monthlyStats: Array<{ month: string; count: number }>
  tagStats: Array<{ name: string; count: number }>
}