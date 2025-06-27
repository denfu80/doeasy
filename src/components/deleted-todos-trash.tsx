"use client"

import { useState } from 'react'
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react'
import { Todo } from '@/types/todo'

interface DeletedTodosTrashProps {
  deletedTodos: Todo[]
  onRestoreTodo: (id: string) => void
  onPermanentDelete: (id: string) => void
  onDeleteAll: () => void
}

export default function DeletedTodosTrash({ deletedTodos, onRestoreTodo, onPermanentDelete, onDeleteAll }: DeletedTodosTrashProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)

  if (deletedTodos.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Mülleimer Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        title={`${deletedTodos.length} gelöschte Todo${deletedTodos.length !== 1 ? 's' : ''}`}
      >
        <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {deletedTodos.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {deletedTodos.length > 9 ? '9+' : deletedTodos.length}
          </span>
        )}
      </button>

      {/* Mülleimer Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-xl shadow-2xl border border-red-200 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Mülleimer</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>

          {/* Deleted Todos List */}
          <div className="max-h-80 overflow-y-auto">
            {deletedTodos.map(todo => (
              <div
                key={todo.id}
                className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-through opacity-70 break-words">
                      {todo.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Gelöscht von {todo.deletedBy || 'Unbekannt'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onRestoreTodo(todo.id)}
                      className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                      title="Wiederherstellen"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPermanentDelete(todo.id)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                      title="Endgültig löschen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">
                {deletedTodos.length} gelöschte Todo{deletedTodos.length !== 1 ? 's' : ''}
              </p>
              
              {deletedTodos.length > 0 && (
                <div className="relative">
                  {!showDeleteAllConfirm ? (
                    <button
                      onClick={() => setShowDeleteAllConfirm(true)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors font-semibold"
                    >
                      <Trash2 className="w-3 h-3" />
                      Alles löschen
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-semibold">Wirklich?</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            onDeleteAll()
                            setShowDeleteAllConfirm(false)
                            setIsOpen(false)
                          }}
                          className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition-colors"
                        >
                          Ja
                        </button>
                        <button
                          onClick={() => setShowDeleteAllConfirm(false)}
                          className="px-2 py-1 text-xs bg-gray-300 hover:bg-gray-400 text-gray-700 rounded font-semibold transition-colors"
                        >
                          Nein
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}