"use client"

import { useState } from 'react'
import { Zap, Database, Users, Settings, X } from 'lucide-react'
import { testFirebaseConnection, createTestTodoList } from '@/lib/firebase-test'
import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import { User as FirebaseUser } from 'firebase/auth'

interface DebugPanelProps {
  firebaseStatus: string
  user: FirebaseUser | null
  listId: string
  todos: any[]
  users: any[]
}

export default function DebugPanel({ firebaseStatus, user, listId, todos, users }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const runFirebaseTest = async () => {
    const result = await testFirebaseConnection()
    setTestResult(result)
  }

  const createTestData = () => {
    createTestTodoList(listId)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition-colors z-50"
        title="Debug Panel öffnen"
      >
        <Settings className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-slate-200 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Debug Panel
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 text-sm">
        {/* Firebase Status */}
        <div>
          <h4 className="font-semibold text-slate-700 flex items-center mb-2">
            <Database className="w-4 h-4 mr-1" />
            Firebase Status
          </h4>
          <div className="bg-slate-50 p-2 rounded text-xs">
            <p><strong>Status:</strong> {firebaseStatus}</p>
            <p><strong>Configured:</strong> {isFirebaseConfigured() ? '✅' : '❌'}</p>
            <p><strong>Auth:</strong> {auth ? '✅' : '❌'}</p>
            <p><strong>Database:</strong> {db ? '✅' : '❌'}</p>
            <p><strong>User ID:</strong> {user?.uid || 'None'}</p>
          </div>
        </div>

        {/* List Info */}
        <div>
          <h4 className="font-semibold text-slate-700 mb-2">List Info</h4>
          <div className="bg-slate-50 p-2 rounded text-xs">
            <p><strong>List ID:</strong> {listId}</p>
            <p><strong>Todos:</strong> {todos.length}</p>
            <p><strong>Active Users:</strong> {users.length}</p>
          </div>
        </div>

        {/* Users */}
        <div>
          <h4 className="font-semibold text-slate-700 flex items-center mb-2">
            <Users className="w-4 h-4 mr-1" />
            Users ({users.length})
          </h4>
          <div className="bg-slate-50 p-2 rounded text-xs max-h-20 overflow-y-auto">
            {users.length > 0 ? (
              users.map(user => (
                <div key={user.id} className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: user.color }}
                  />
                  <span>{user.name}</span>
                  <span className="text-slate-400">
                    {user.onlineAt && typeof user.onlineAt === 'object' ? '🟢' : '🔴'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No users online</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={runFirebaseTest}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded text-xs hover:bg-blue-600 transition-colors"
          >
            Firebase Test ausführen
          </button>
          
          {isFirebaseConfigured() && (
            <button
              onClick={createTestData}
              className="w-full bg-green-500 text-white px-3 py-2 rounded text-xs hover:bg-green-600 transition-colors"
            >
              Test-Todos erstellen
            </button>
          )}
        </div>

        {/* Test Results */}
        {testResult && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Test Ergebnis</h4>
            <div className="bg-slate-50 p-2 rounded text-xs">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}