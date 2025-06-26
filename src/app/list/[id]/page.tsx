"use client"

import { useParams } from 'next/navigation'
import TodoApp from '@/components/todo-app'

export default function TodoListPage() {
  const params = useParams()
  const listId = params.id as string

  return <TodoApp listId={listId} />
}