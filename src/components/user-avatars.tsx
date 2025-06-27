import { User } from '@/types/todo'
import { useState, useRef, useEffect } from 'react'
import { Check, Edit3 } from 'lucide-react'

interface UserAvatarsProps {
  users: User[]
  currentUserId?: string
  userName?: string
  onNameChange?: (name: string) => void
}

export default function UserAvatars({ users, currentUserId, userName, onNameChange }: UserAvatarsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingName, setEditingName] = useState(userName || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditingName(userName || '')
  }, [userName])

  // Handle click outside to close expanded state
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isEditing) {
          handleNameCancel()
        } else if (isExpanded) {
          setIsExpanded(false)
        }
      }
    }

    if (isExpanded || isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded, isEditing])

  // Sort users to show current user first, then others
  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === currentUserId) return -1
    if (b.id === currentUserId) return 1
    // Sort others by online status
    const aOnline = a.onlineAt && typeof a.onlineAt === 'object'
    const bOnline = b.onlineAt && typeof b.onlineAt === 'object'
    if (aOnline && !bOnline) return -1
    if (!aOnline && bOnline) return 1
    return 0
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const isOnline = (user: User) => {
    return user.onlineAt && typeof user.onlineAt === 'object'
  }

  const handleAvatarClick = (user: User) => {
    if (user.id === currentUserId) {
      if (!isExpanded) {
        setIsExpanded(true)
      } else if (!isEditing) {
        setIsEditing(true)
      }
    }
  }

  const handleNameSave = () => {
    if (editingName.trim() && onNameChange) {
      onNameChange(editingName.trim())
    }
    setIsEditing(false)
  }

  const handleNameCancel = () => {
    setEditingName(userName || '')
    setIsEditing(false)
    setIsExpanded(false)
  }

  return (
    <div 
      ref={containerRef}
      className="flex items-center -space-x-2 relative"
    >
      {sortedUsers.slice(0, 5).map(user => {
        const isCurrentUser = user.id === currentUserId
        const userIsOnline = isOnline(user)
        
        return (
          <div key={user.id} className="relative">
            {/* Expanded Name Editor for Current User */}
            {isCurrentUser && isExpanded && (
              <div 
                className={`absolute right-0 top-0 bg-white rounded-xl shadow-lg border border-purple-200 flex items-center gap-2 pr-14 pl-4 py-2 z-50 transition-all duration-500 ease-out ${
                  isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{
                  transform: isExpanded ? 'translateX(-10px)' : 'translateX(20px)',
                }}
              >
                {isEditing ? (
                  <>
                    <input
                      ref={inputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNameSave()
                        if (e.key === 'Escape') handleNameCancel()
                      }}
                      className="font-semibold bg-purple-50 text-purple-800 px-3 py-1 rounded-lg border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-sm min-w-32"
                      placeholder="Dein Name..."
                    />
                    <button 
                      onClick={handleNameSave}
                      className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                      title="Speichern"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span 
                      className="font-semibold text-slate-800 cursor-pointer hover:text-purple-700 transition-colors text-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      {userName}
                    </span>
                    <Edit3 className="w-3 h-3 text-slate-400 cursor-pointer hover:text-purple-500 transition-colors" onClick={() => setIsEditing(true)} />
                  </>
                )}
              </div>
            )}

            {/* Avatar */}
            <div 
              className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-500 hover:scale-110 hover:z-40 cursor-pointer ${
                isCurrentUser 
                  ? 'border-yellow-300 ring-2 ring-yellow-400 ring-opacity-50' 
                  : 'border-white'
              } ${
                userIsOnline ? 'opacity-100' : 'opacity-60'
              } ${
                isCurrentUser && isExpanded ? 'scale-110 z-50' : ''
              }`}
              style={{ 
                backgroundColor: user.color, 
                zIndex: isCurrentUser ? (isExpanded ? 50 : 100) : user.zIndex,
                transform: isCurrentUser && isExpanded ? 'rotate(-360deg)' : 'rotate(0deg)'
              }}
              title={`${user.name}${isCurrentUser ? ' (Du) - Klick zum Bearbeiten' : ''} ${userIsOnline ? '🟢 Online' : '⚫ Offline'}`}
              onClick={() => handleAvatarClick(user)}
            >
              <span className="text-sm font-bold text-white drop-shadow-sm">
                {getInitials(user.name || user.id)}
              </span>
              
              {/* Online indicator */}
              {userIsOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
              )}
              
              {/* Current user indicator */}
              {isCurrentUser && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-xs text-yellow-800">✨</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
      
      {users.length > 5 && (
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-300 border-2 border-white shadow-md hover:scale-110 transition-transform" 
          title={`${users.length - 5} weitere Nutzer`}
        >
          <span className="text-sm font-bold text-slate-700">+{users.length - 5}</span>
        </div>
      )}
      
      {/* User count info */}
      <div className="ml-3 text-sm text-slate-500 font-medium">

        {users.filter(isOnline).length > 0 && (
          <span className="text-green-600 ml-1">
            ({users.filter(isOnline).length} online)
          </span>
        )}
      </div>
    </div>
  )
}