"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Crown, Edit3, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import {
  ref,
  onValue,
  off
} from 'firebase/database'
import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import { generateFunnyName } from '@/lib/name-generator'
import { User } from '@/types/todo'
import { isUserOnline, getOnlineStatus, filterUsersByTime, sortUsersByLastSeen } from '@/lib/presence-utils'

interface UsersPageProps {
  listId: string
}

export default function UsersPage({ listId }: UsersPageProps) {
  const router = useRouter()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [userName, setUserName] = useState('')
  const [listName, setListName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingName, setEditingName] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Firebase Authentication
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      console.error('❌ Firebase not configured')
      return
    }

    const initFirebase = async () => {
      try {
        if (auth && auth.currentUser) {
          setUser(auth.currentUser)
          const savedName = localStorage.getItem('macheinfach-username') || generateFunnyName()
          setUserName(savedName)
          setIsAuthReady(true)
          return null
        }

        const userCredential = await signInAnonymously(auth!)
        setUser(userCredential.user)
        const savedName = localStorage.getItem('macheinfach-username') || generateFunnyName()
        localStorage.setItem('macheinfach-username', savedName)
        setUserName(savedName)
        setIsAuthReady(true)

        const unsubscribe = onAuthStateChanged(auth!, (firebaseUser) => {
          if (firebaseUser && firebaseUser.uid !== userCredential.user.uid) {
            setUser(firebaseUser)
          }
        })

        return unsubscribe
      } catch (error) {
        console.error('❌ Auth failed:', error)
        return null
      }
    }

    let cleanup: (() => void) | null = null

    initFirebase().then((cleanupFn) => {
      cleanup = cleanupFn
    })

    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [])

  // Load users and list name
  useEffect(() => {
    if (!isAuthReady || !user || !isFirebaseConfigured() || !db) return

    const presenceRef = ref(db, `lists/${listId}/presence`)
    const listNameRef = ref(db, `lists/${listId}/metadata/name`)

    const unsubscribePresence = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const allUsers = Object.keys(data)
          .map(userId => ({
            id: userId,
            ...data[userId]
          } as User))

        // Filter users active in last 24 hours
        const activeUsers = filterUsersByTime(allUsers, 24 * 60) // 24 hours in minutes

        // Sort: current user first, then by last seen time
        const sortedUsers = sortUsersByLastSeen(activeUsers, user.uid)

        setUsers(sortedUsers)
      } else {
        setUsers([])
      }
    })

    const unsubscribeListName = onValue(listNameRef, (snapshot) => {
      const name = snapshot.val()
      setListName(name || listId)
    })

    return () => {
      off(presenceRef, 'value', unsubscribePresence)
      off(listNameRef, 'value', unsubscribeListName)
    }
  }, [isAuthReady, user, listId])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const isOnline = (user: User) => {
    return isUserOnline(user)
  }

  const getLastSeenText = (user: User) => {
    const status = getOnlineStatus(user)
    return status.text
  }

  const handleBack = () => {
    router.back()
  }

  const isCurrentUser = (userId: string) => user?.uid === userId

  const handleEditName = () => {
    setEditingName(userName)
    setIsEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 100)
  }

  const handleSaveName = () => {
    if (editingName.trim()) {
      setUserName(editingName.trim())
      localStorage.setItem('macheinfach-username', editingName.trim())
      setIsEditingName(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingName(userName)
    setIsEditingName(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-slate-600 hover:text-slate-900 hover:bg-purple-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Nutzer</h1>
                  <p className="text-sm text-slate-500 font-mono">{listName}</p>
                </div>
              </div>
            </div>

            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              {users.length} {users.length === 1 ? 'Nutzer' : 'Nutzer'}
            </Badge>
          </div>
        </div>
      </header>

      {/* Users List */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-slate-600 text-lg">Keine Nutzer gefunden</p>
              <p className="text-slate-400 text-sm mt-1">Lade die Liste neu oder teile den Link</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((listUser, index) => (
                <div
                  key={listUser.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md transition-all duration-300 ${
                    isCurrentUser(listUser.id) 
                      ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' 
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-md ${
                          isCurrentUser(listUser.id) 
                            ? 'border-yellow-300 ring-2 ring-yellow-400 ring-opacity-50' 
                            : 'border-white'
                        }`}
                        style={{ backgroundColor: listUser.color }}
                      >
                        <span className="text-sm font-bold text-white drop-shadow-sm">
                          {getInitials(listUser.name || listUser.id)}
                        </span>

                        {/* Online indicator */}
                        {isOnline(listUser) && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {/* Name display/edit */}
                        {isCurrentUser(listUser.id) && isEditingName ? (
                          <div className="flex items-center space-x-2">
                            <input
                              ref={nameInputRef}
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="font-semibold bg-white text-slate-800 px-3 py-1 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-sm min-w-32"
                              placeholder="Dein Name..."
                            />
                            <button
                              onClick={handleSaveName}
                              className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              title="Speichern"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Abbrechen"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-slate-800">
                              {listUser.name}
                            </h3>

                            {/* Edit button for current user */}
                            {isCurrentUser(listUser.id) && (
                              <button
                                onClick={handleEditName}
                                className="p-1 text-slate-400 hover:text-purple-500 hover:bg-purple-50 rounded transition-colors"
                                title="Name bearbeiten"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}

                            {/* Admin badge (placeholder for later) */}
                            {index === 0 && !isCurrentUser(listUser.id) && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5">
                                <Crown className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <p className={`text-sm ${
                        isOnline(listUser) 
                          ? 'text-green-600 font-medium' 
                          : 'text-slate-500'
                      }`}>
                        {isOnline(listUser) && <span className="mr-1">🟢</span>}
                        {getLastSeenText(listUser)}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
