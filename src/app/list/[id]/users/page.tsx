"use client"

import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled for Firebase Auth compatibility
const UsersPage = dynamic(() => import('@/components/users-page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
      <div className="flex items-center space-x-3 text-slate-600">
        <div className="w-8 h-8 bg-purple-500 rounded-full animate-spin flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <span className="text-xl font-bold">Nutzer werden geladen...</span>
      </div>
    </div>
  )
})

export default function TodoListUsersPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params.id as string

  return <UsersPage listId={listId} />
}