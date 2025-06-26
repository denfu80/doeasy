import { Timestamp } from 'firebase/firestore'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Timestamp
  createdBy: string
  creatorName: string
}

export interface User {
  id: string
  name: string
  color: string
  onlineAt: Timestamp
  zIndex?: number
}