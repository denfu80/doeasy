export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number | object // Realtime Database timestamp
  createdBy: string
  creatorName: string
  deletedAt?: number | object | null // Realtime Database timestamp for soft-delete
  deletedBy?: string // Who deleted this todo
}

export interface User {
  id: string
  name: string
  color: string
  onlineAt: number | object | null // Realtime Database timestamp
  lastSeen?: number | object // Optional lastSeen timestamp
  isTyping?: boolean // Optional typing indicator
  editingTodoId?: string // Which todo is being edited
  zIndex?: number
}

export interface GuestLink {
  id: string
  createdBy: string
  createdAt: number | object
  revoked?: boolean
  revokedAt?: number | object | null
  revokedBy?: string | null
}

export type UserRole = 'normal' | 'guest'