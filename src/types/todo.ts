export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number | object // Realtime Database timestamp
  createdBy: string
  creatorName: string
  completedBy?: string // Who completed this todo
  completedByName?: string // Name of who completed this todo
  completedAt?: number | object | null // When this todo was completed
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
  listId: string
  createdBy: string
  createdAt: number | object
  revoked?: boolean
  revokedAt?: number | object | null
  revokedBy?: string | null
  name?: string
  guestDisplayName?: string
  expiresAt?: number | null
  password?: string
  lastAccessAt?: number | null
  accessCount?: number
}

export interface ListPassword {
  hashedPassword: string
  createdBy: string
  createdAt: number | object
  updatedAt?: number | object
}

export interface GuestComment {
  id: string
  todoId: string
  text: string
  guestName: string
  guestLinkId: string
  createdAt: number | object
}

export type UserRole = 'normal' | 'guest'