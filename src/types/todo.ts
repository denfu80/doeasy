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

export interface Admin {
  uid: string
  name: string
  claimedAt: number | object
  isLocallyStored: boolean
}

export interface PasswordSettings {
  adminPassword?: string
  normalPassword?: string
  guestPassword?: string
  enabledModes?: {
    adminPasswordEnabled: boolean
    normalPasswordEnabled: boolean
    guestPasswordEnabled: boolean
  }
}

export interface GuestLink {
  id: string
  createdBy: string
  createdAt: number | object
  revoked?: boolean
  revokedAt?: number | object | null
  revokedBy?: string | null
}

export type UserRole = 'admin' | 'normal' | 'guest'

export interface ListPermissions {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canManageUsers: boolean
  canManageSettings: boolean
}