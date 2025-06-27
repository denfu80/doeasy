"use client"

import { useState, useEffect, useRef } from 'react'
import { Check, Edit3, Sparkles, User } from 'lucide-react'
import { generateColor } from '@/lib/name-generator'

interface UserNameEditorProps {
  userName: string
  setUserName: (name: string) => void
  userId?: string
  className?: string
}

export default function UserNameEditor({ userName, setUserName, userId, className = '' }: UserNameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [currentName, setCurrentName] = useState(userName)
  const nameInputRef = useRef<HTMLInputElement>(null)
  
  const userColor = userId ? generateColor(userId) : '#9333ea'

  useEffect(() => {
    setCurrentName(userName)
  }, [userName])

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }
  }, [isEditingName])

  const handleNameUpdate = () => {
    if (currentName.trim()) {
      setUserName(currentName.trim())
      localStorage.setItem('machhalt-username', currentName.trim())
    } else {
      setCurrentName(userName)
    }
    setIsEditingName(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {isEditingName ? (
        <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-lg border border-purple-200">
          {/* Avatar während Editing */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-purple-300 shadow-md"
            style={{ backgroundColor: userColor }}
          >
            <span className="text-sm font-bold text-white">
              {getInitials(currentName || userName)}
            </span>
          </div>
          
          {/* Eingabefeld */}
          <div className="flex items-center gap-2">
            <input
              ref={nameInputRef}
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              onBlur={handleNameUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
              className="font-semibold bg-purple-50 text-purple-800 px-4 py-2 rounded-lg text-center border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="Dein Name..."
            />
            <button 
              onClick={handleNameUpdate} 
              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              title="Namen speichern"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="flex items-center gap-3 group cursor-pointer bg-white hover:bg-purple-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-transparent hover:border-purple-200" 
          onClick={() => setIsEditingName(true)}
          title="Klicken zum Bearbeiten"
        >
          {/* Avatar */}
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-yellow-300 ring-2 ring-yellow-400 ring-opacity-30 shadow-lg"
              style={{ backgroundColor: userColor }}
            >
              <span className="text-sm font-bold text-white drop-shadow-sm">
                {getInitials(userName)}
              </span>
            </div>
            {/* Du-Indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-yellow-800" />
            </div>
          </div>
          
          {/* Name und Edit-Info */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">Du</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                {userName}
              </span>
              <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}