"use client"

import { useState, useEffect, useRef } from 'react'
import { Check, Trash2, Edit3, Calendar, Tag, MessageSquare } from 'lucide-react'
import { Todo, User, ListFlavour } from '@/types/todo'

interface TodoItemProps {
  todo: Todo
  users: User[]
  currentUserId?: string
  flavour: ListFlavour
  onToggle: (id: string, completed: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, text: string) => Promise<void>
  onEditingChange: (todoId: string | null, isTyping: boolean) => void
  guestComments?: number // Count of guest comments
}

export default function TodoItem({ todo, users, currentUserId, flavour, onToggle, onDelete, onUpdate, onEditingChange, guestComments = 0 }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
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
    onEditingChange(null, false)
  }

  const handleTextClick = () => {
    if (isTouchDevice) {
      // Mobile: First click selects, second click edits
      if (!isSelected) {
        setIsSelected(true)
      } else {
        setIsEditing(true)
        onEditingChange(todo.id, true)
      }
    } else {
      // Desktop: Direct edit on click
      setIsEditing(true)
      onEditingChange(todo.id, true)
    }
  }

  // Handle typing indicator
  const handleTextChange = (value: string) => {
    setText(value)
    onEditingChange(todo.id, true)
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

  // Find users editing this todo (excluding current user)
  const editingUsers = users.filter(user => 
    user.editingTodoId === todo.id && 
    user.id !== currentUserId && 
    user.isTyping
  )

  return (
    <div
      className={`flex flex-col transition-all duration-300 group relative ${
        todo.completed
          ? 'bg-slate-100 text-slate-500'
          : isSelected
          ? 'bg-blue-50 shadow-md border-2 border-blue-200'
          : editingUsers.length > 0
          ? 'bg-yellow-50 shadow-md border-2 border-yellow-200'
          : 'bg-white shadow-sm hover:shadow-md'
      } rounded-lg md:rounded-xl overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => !isTouchDevice && setIsExpanded(true)}
      onMouseLeave={() => !isTouchDevice && setIsExpanded(false)}
    >
      {/* Main Todo Content */}
      <div className="flex items-center p-3 md:p-4">
      {/* Editing indicator */}
      {editingUsers.length > 0 && (
        <div className="absolute -top-2 -right-2 flex space-x-1">
          {editingUsers.slice(0, 3).map(user => (
            <div
              key={user.id}
              className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
              style={{ backgroundColor: user.color }}
              title={`${user.name} editiert gerade...`}
            >
              <Edit3 className="w-2.5 h-2.5 text-white animate-pulse" />
            </div>
          ))}
          {editingUsers.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-gray-400 border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-xs text-white font-bold">+{editingUsers.length - 3}</span>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`w-5 h-5 md:w-7 md:h-7 rounded md:rounded-lg flex-shrink-0 flex items-center justify-center mr-3 md:mr-4 transition-all duration-300 border-2 ${
          todo.completed 
            ? 'bg-green-400 border-green-400' 
            : 'border-slate-300 hover:border-pink-400'
        }`}
      >
        {todo.completed && <Check className="w-3 h-3 md:w-5 md:h-5 text-white" />}
      </button>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdate()
            if (e.key === 'Escape') {
              setText(todo.text)
              setIsEditing(false)
              setIsSelected(false)
              onEditingChange(null, false)
            }
          }}
          className="flex-grow bg-transparent focus:outline-none text-slate-800 text-sm md:text-base"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex-grow cursor-pointer select-none" onClick={handleTextClick}>
          <p
            className={`text-sm md:text-base ${
              todo.completed ? 'line-through' : ''
            } ${
              isTouchDevice && isSelected ? 'text-blue-700 font-medium' : ''
            }`}
          >
            {todo.text}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {todo.completed && todo.completedByName
              ? `✓ abgehakt von ${todo.completedByName}`
              : `erstellt von ${todo.creatorName}`
            }
          </p>
        </div>
      )}

      {/* Actions - Show on desktop hover or mobile selection, hide during editing */}
      {!isEditing && (
        <div className={`flex items-center transition-all duration-300 ${
          isTouchDevice
            ? (isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none')
            : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      )}
      </div>

      {/* Expanded Actions Section - Only for mach.einfach flavour */}
      {flavour === 'mach' && isExpanded && !isEditing && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Deadline Button */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-medium transition-colors"
              title="Deadline setzen"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Deadline</span>
            </button>

            {/* Priority Button */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-lg text-xs font-medium transition-colors"
              title="Priorität setzen"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Priorität</span>
            </button>

            {/* Comments Button */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors"
              title="Kommentare anzeigen"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kommentare</span>
              {guestComments > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {guestComments}
                </span>
              )}
            </button>

            {/* Delete Button (moved here when expanded) */}
            <button
              onClick={() => onDelete(todo.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors ml-auto"
              title="Löschen"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Löschen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}