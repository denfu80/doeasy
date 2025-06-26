export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number | object // Realtime Database timestamp
  createdBy: string
  creatorName: string
}

export interface User {
  id: string
  name: string
  color: string
  onlineAt: number | object // Realtime Database timestamp
  zIndex?: number
}