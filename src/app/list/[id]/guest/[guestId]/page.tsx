"use client"

import { useParams } from 'next/navigation'
import GuestTodoApp from '@/components/guest-todo-app'

export default function GuestListPage() {
  const params = useParams()
  const listId = params.id as string
  const guestId = params.guestId as string

  return (
    <GuestTodoApp 
      listId={listId} 
      guestId={guestId}
    />
  )
}