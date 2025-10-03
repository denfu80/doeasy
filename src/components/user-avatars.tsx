import {User} from '@/types/todo'
import {useCallback, useEffect, useRef, useState} from 'react'
import {Check, Edit3} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {isUserOnline, getOnlineStatus, sortUsersByLastSeen} from '@/lib/presence-utils'

interface UserAvatarsProps {
    users: User[]
    currentUserId?: string
    userName?: string
    onNameChange?: (name: string) => void
    listId: string
}

export default function UserAvatars({users, currentUserId, userName, onNameChange, listId}: UserAvatarsProps) {
    const router = useRouter()
    const [isExpanded, setIsExpanded] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingName, setEditingName] = useState(userName || '')
    const [, forceUpdate] = useState({})
    const [clickedUserId, setClickedUserId] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    useEffect(() => {
        setEditingName(userName || '')
    }, [userName])

    // Update online status indicators every minute
    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate({})
        }, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [])

    // Handle click outside to close expanded state
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isEditing) {
                    // Inline logic to avoid dependency issues
                    setEditingName(userName || '')
                    setIsEditing(false)
                    setIsExpanded(false)
                } else if (isExpanded) {
                    setIsExpanded(false)
                }
            }
        }

        if (isExpanded || isEditing) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isExpanded, isEditing, userName])

    // Cleanup click timeout on unmount
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current)
            }
        }
    }, [])

    const handleNameCancel = () => {
        setEditingName(userName || '')
        setIsEditing(false)
        setIsExpanded(false)
    }

    // Sort users to show current user first, then others
    const sortedUsers = sortUsersByLastSeen(users, currentUserId)

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .filter(word => word.length > 0)
            .map(word => {
                // Find first alphanumeric character
                const match = word.match(/[a-zA-Z0-9]/)
                return match ? match[0] : ''
            })
            .filter(char => char !== '')
            .join('')
            .substring(0, 2)
            .toUpperCase()
    }


    const handleAvatarClick = (user: User) => {
        // Highlight effect for clicked avatar
        setClickedUserId(user.id)
        setTimeout(() => setClickedUserId(null), 600)

        // Single click: Navigate to users page for any avatar
        if (clickTimeoutRef.current) {
            // This is part of a double-click, cancel single-click action
            clearTimeout(clickTimeoutRef.current)
            clickTimeoutRef.current = null
            return
        }

        clickTimeoutRef.current = setTimeout(() => {
            clickTimeoutRef.current = null
            // Single click confirmed - navigate to users page
            router.push(`/list/${listId}/users`)
        }, 250) // Wait 250ms to detect double-click
    }

    const handleAvatarDoubleClick = (user: User) => {
        // Clear single-click timeout
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current)
            clickTimeoutRef.current = null
        }

        // Double-click on own avatar: Open name editor
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
            // Remove line breaks and extra whitespace
            const cleanedName = editingName.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
            onNameChange(cleanedName)
        }
        setIsEditing(false)
    }

    return (
        <div
            ref={containerRef}
            className="flex items-center -space-x-2 relative"
        >
            {sortedUsers.slice(0, 5).map(user => {
                const isCurrentUser = user.id === currentUserId
                const userIsOnline = isUserOnline(user)
                const status = getOnlineStatus(user)

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
                                            onChange={(e) => {
                                                // Remove line breaks immediately while typing
                                                const cleanedValue = e.target.value.replace(/[\r\n]+/g, ' ')
                                                setEditingName(cleanedValue)
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleNameSave()
                                                if (e.key === 'Escape') handleNameCancel()
                                            }}
                                            className="font-semibold bg-purple-50 text-purple-800 px-3 py-1 rounded-lg border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-sm min-w-32 whitespace-nowrap overflow-hidden text-ellipsis"
                                            placeholder="Dein Name..."
                                        />
                                        <button
                                            onClick={handleNameSave}
                                            className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                            title="Speichern"
                                        >
                                            <Check className="w-4 h-4"/>
                                        </button>
                                    </>
                                ) : (
                                    <>
                    <span
                        className="font-semibold text-slate-800 cursor-pointer hover:text-purple-700 transition-colors text-sm whitespace-nowrap"
                        onClick={() => setIsEditing(true)}
                    >
                      {userName}
                    </span>
                                        <Edit3
                                            className="w-3 h-3 text-slate-400 cursor-pointer hover:text-purple-500 transition-colors"
                                            onClick={() => setIsEditing(true)}/>
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
                            } ${
                                clickedUserId === user.id ? 'ring-4 ring-purple-400 ring-opacity-75 scale-125 shadow-2xl' : ''
                            }`}
                            style={{
                                backgroundColor: user.color,
                                zIndex: isCurrentUser ? (isExpanded ? 50 : 100) : user.zIndex,
                                transform: isCurrentUser && isExpanded ? 'rotate(-360deg)' : 'rotate(0deg)'
                            }}
                            title={`${user.name}${isCurrentUser ? ' (Du) - Doppelklick zum Bearbeiten' : ''} - ${status.icon} ${status.text} (${status.lastSeenText})`}
                            onClick={() => handleAvatarClick(user)}
                            onDoubleClick={() => handleAvatarDoubleClick(user)}
                        >
              <span className="text-sm font-bold text-white drop-shadow-sm">
                {getInitials(user.name || user.id)}
              </span>

                            {/* Status indicator */}
                            <div
                                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                    status.state === 'online' ? 'bg-green-400' :
                                    status.state === 'inactive' ? 'bg-yellow-400' :
                                    'bg-gray-400'
                                }`}
                            />

                            {/* Current user indicator */}
                            {isCurrentUser && (
                                <div
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
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


        </div>
    )
}
