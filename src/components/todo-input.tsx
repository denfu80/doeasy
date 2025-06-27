"use client"

import { useState, useRef, FormEvent } from 'react'
import { Plus } from 'lucide-react'

interface TodoInputProps {
  onAddTodo: (text: string) => Promise<void>
}

export default function TodoInput({ onAddTodo }: TodoInputProps) {
  const [newTodo, setNewTodo] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (newTodo.trim() === '') return
    
    await onAddTodo(newTodo.trim())
    setNewTodo('')
    inputRef.current?.focus()
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="mb-4 md:mb-8 flex items-center bg-white p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-pink-400 transition-all gap-1 md:gap-2"
    >
      <Plus className="w-4 h-4 md:w-6 md:h-6 text-slate-400 ml-1 md:ml-2 flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Was gibt's zu tun?"
        className="flex-1 bg-transparent text-sm md:text-lg text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
      />
      <button 
        type="submit" 
        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-3 py-2 md:px-6 md:py-3 rounded md:rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-md text-sm md:text-base flex-shrink-0"
      >
        <span className="hidden md:inline">Hinzufügen</span>
        <Plus className="w-4 h-4 md:hidden" />
      </button>
    </form>
  )
}