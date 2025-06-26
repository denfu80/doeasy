"use client"

import { useState, useEffect, useRef } from 'react'
import { Check, Edit3 } from 'lucide-react'

interface UserNameEditorProps {
  userName: string
  setUserName: (name: string) => void
}

export default function UserNameEditor({ userName, setUserName }: UserNameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [currentName, setCurrentName] = useState(userName)
  const nameInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="text-center mt-12">
      {isEditingName ? (
        <div className="flex justify-center items-center gap-2">
          <input
            ref={nameInputRef}
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            onBlur={handleNameUpdate}
            onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
            className="font-mono bg-white text-slate-600 px-2 py-1 rounded-md text-sm text-center shadow-inner"
          />
          <button onClick={handleNameUpdate} className="p-1 text-green-500 hover:text-green-700">
            <Check className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
          <span className="text-sm font-semibold text-slate-500">Du:</span>
          <p className="text-sm text-slate-500 font-mono bg-slate-200 px-3 py-2 rounded-lg group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors shadow-sm">
            {userName}
          </p>
          <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  )
}