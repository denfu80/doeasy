"use client"

import { useParams } from 'next/navigation'
import GuestTodoApp from '@/components/guest-todo-app'

export default function GuestListPage() {
  const params = useParams()
  const guestId = params.guestId as string

  return (
    <GuestTodoApp
      guestId={guestId}
    />
  )
}
