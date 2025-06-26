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
      className="mb-8 flex items-center bg-white p-3 rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-pink-400 transition-all"
    >
      <Plus className="w-6 h-6 text-slate-400 mx-2" />
      <input
        ref={inputRef}
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Was gibt's zu tun?"
        className="w-full bg-transparent text-lg text-slate-800 placeholder-slate-400 focus:outline-none"
      />
      <button 
        type="submit" 
        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-md"
      >
        Hinzufügen
      </button>
    </form>
  )
}