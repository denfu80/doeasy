"use client"

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled for Firebase Auth compatibility
const TodoApp = dynamic(() => import('@/components/todo-app'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
      <div className="flex items-center space-x-3 text-slate-600">
        <div className="w-8 h-8 bg-purple-500 rounded-full animate-spin flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <span className="text-xl font-bold">Liste wird geladen...</span>
      </div>
    </div>
  )
})

export default function TodoListPage() {
  const params = useParams()
  const listId = params.id as string

  return <TodoApp listId={listId} />
}