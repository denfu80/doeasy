"use client"

import { useState, useEffect, useRef } from 'react'
import { Check, Trash2, Edit3, Save } from 'lucide-react'
import { Todo } from '@/types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, completed: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, text: string) => Promise<void>
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpdate = () => {
    if (text.trim()) {
      onUpdate(todo.id, text.trim())
    }
    setIsEditing(false)
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  return (
    <div className={`flex items-center p-4 rounded-xl transition-all duration-300 group ${
      todo.completed 
        ? 'bg-slate-100 text-slate-500' 
        : 'bg-white shadow-sm hover:shadow-md'
    }`}>
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mr-4 transition-all duration-300 border-2 ${
          todo.completed 
            ? 'bg-green-400 border-green-400' 
            : 'border-slate-300 hover:border-pink-400'
        }`}
      >
        {todo.completed && <Check className="w-5 h-5 text-white" />}
      </button>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
          className="flex-grow bg-transparent focus:outline-none"
        />
      ) : (
        <p 
          className={`flex-grow cursor-pointer ${todo.completed ? 'line-through' : ''}`}
          onClick={() => setIsEditing(true)}
        >
          {todo.text}
        </p>
      )}

      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <button onClick={handleUpdate} className="p-2 text-green-500 hover:text-green-700">
            <Save className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-purple-500">
            <Edit3 className="w-5 h-5" />
          </button>
        )}
        <button onClick={() => onDelete(todo.id)} className="p-2 text-slate-400 hover:text-red-500">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}