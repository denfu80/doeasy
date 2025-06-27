"use client"

import { useState, useEffect, useRef } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { Todo } from '@/types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, completed: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, text: string) => Promise<void>
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [text, setText] = useState(todo.text)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleUpdate = () => {
    if (text.trim()) {
      onUpdate(todo.id, text.trim())
    }
    setIsEditing(false)
    setIsSelected(false)
  }

  const handleTextClick = () => {
    if (isTouchDevice) {
      // Mobile: First click selects, second click edits
      if (!isSelected) {
        setIsSelected(true)
      } else {
        setIsEditing(true)
      }
    } else {
      // Desktop: Direct edit on click
      setIsEditing(true)
    }
  }

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = () => {
      if (!isEditing) {
        setIsSelected(false)
      }
    }
    
    if (isSelected) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isSelected, isEditing])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  return (
    <div 
      className={`flex items-center p-4 rounded-xl transition-all duration-300 group ${
        todo.completed 
          ? 'bg-slate-100 text-slate-500' 
          : isSelected 
          ? 'bg-blue-50 shadow-md border-2 border-blue-200'
          : 'bg-white shadow-sm hover:shadow-md'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdate()
            if (e.key === 'Escape') {
              setText(todo.text)
              setIsEditing(false)
              setIsSelected(false)
            }
          }}
          className="flex-grow bg-transparent focus:outline-none text-slate-800"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p 
          className={`flex-grow cursor-pointer select-none ${
            todo.completed ? 'line-through' : ''
          } ${
            isTouchDevice && isSelected ? 'text-blue-700 font-medium' : ''
          }`}
          onClick={handleTextClick}
        >
          {todo.text}
        </p>
      )}

      {/* Actions - Show on desktop hover or mobile selection, hide during editing */}
      {!isEditing && (
        <div className={`flex items-center space-x-2 transition-all duration-300 ${
          isTouchDevice 
            ? (isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none')
            : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button 
            onClick={() => onDelete(todo.id)} 
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}