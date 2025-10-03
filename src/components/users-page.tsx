"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Crown, Edit3, Check, X, Trash2, Filter, Zap } from 'lucide-react'
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
  off,
  update,
  serverTimestamp,
  set,
  remove
} from 'firebase/database'
import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import { generateFunnyName, generateColor } from '@/lib/name-generator'
import { User } from '@/types/todo'
import { isUserOnline, getOnlineStatus, filterUsersByTime, sortUsersByLastSeen } from '@/lib/presence-utils'
import ToastNotification from './toast-notification'

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
  const [showAllUsers, setShowAllUsers] = useState(false)
  const [allUsersList, setAllUsersList] = useState<User[]>([])
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('info')
  const [lastDeletedUser, setLastDeletedUser] = useState<{id: string, data: Record<string, unknown>} | null>(null)

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

  // Real-time Presence Tracking
  useEffect(() => {
    if (!isAuthReady || !user || !userName) return

    if (!isFirebaseConfigured() || !db) {
      console.error('❌ Firebase database not available for presence tracking')
      return
    }

    const userRef = ref(db, `lists/${listId}/presence/${user.uid}`)
    const userColor = generateColor(user.uid)

    const baseUserPresence = {
      color: userColor,
      name: userName,
      isTyping: false,
      editingTodoId: null
    }

    // Function to update presence with current timestamp
    const updatePresence = async () => {
      const userPresence = {
        ...baseUserPresence,
        lastSeen: serverTimestamp()
      }

      try {
        await set(userRef, userPresence)
        console.log('✅ Presence updated successfully on users page')
      } catch (error: any) {
        console.error('❌ Presence update failed:', error.code, error.message)
      }
    }

    // Set initial presence
    setTimeout(updatePresence, 100)

    // Set up heartbeat to continuously update presence every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (!document.hidden) {
        updatePresence()
      }
    }, 30000) // 30 seconds

    // Handle disconnect using visibility API
    const handleVisibilityChange = () => {
      if (document.hidden) {
        set(userRef, {
          ...baseUserPresence,
          lastSeen: serverTimestamp()
        })
      } else {
        updatePresence()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', () => {
      set(userRef, {
        ...baseUserPresence,
        lastSeen: serverTimestamp()
      })
    })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(heartbeatInterval)
    }
  }, [isAuthReady, user, userName, listId])

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

        // Store all users for potential filtering
        setAllUsersList(allUsers)

        // Filter based on toggle state
        const filteredUsers = showAllUsers
          ? allUsers
          : filterUsersByTime(allUsers, 24 * 60) // 24 hours in minutes

        // Sort: current user first, then by last seen time
        const sortedUsers = sortUsersByLastSeen(filteredUsers, user.uid)

        setUsers(sortedUsers)
      } else {
        setUsers([])
        setAllUsersList([])
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
  }, [isAuthReady, user, listId, showAllUsers])

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

  const isOnline = (user: User) => {
    return isUserOnline(user)
  }

  const getLastSeenText = (user: User) => {
    const status = getOnlineStatus(user)
    return status.text
  }

  const handleBack = () => {
    // Check if we have browser history within our app
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Check if previous page was from our app (list or guest page)
      const referrer = document.referrer
      if (referrer && (referrer.includes(`/list/${listId}`) || referrer.includes('/guest/'))) {
        router.back()
        return
      }
    }

    // Fallback: Navigate to the list page (works for both normal and guest access)
    router.push(`/list/${listId}`)
  }

  const isCurrentUser = (userId: string) => user?.uid === userId

  const handleEditName = () => {
    setEditingName(userName)
    setIsEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 100)
  }

  const handleSaveName = async () => {
    if (editingName.trim()) {
      // Remove line breaks and extra whitespace
      const cleanedName = editingName.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
      setUserName(cleanedName)
      localStorage.setItem('macheinfach-username', cleanedName)
      setIsEditingName(false)

      // Immediately update Firebase presence with new name
      if (user && isFirebaseConfigured() && db) {
        const userRef = ref(db, `lists/${listId}/presence/${user.uid}`)
        try {
          await update(userRef, {
            name: cleanedName,
            lastSeen: serverTimestamp()
          })
          console.log('✅ Name updated in Firebase immediately')
        } catch (error) {
          console.error('❌ Failed to update name in Firebase:', error)
        }
      }
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!isFirebaseConfigured() || !db) return

    try {
      // Get current user data before deleting
      const userToDelete = allUsersList.find(u => u.id === userId)
      if (!userToDelete) return

      // Store for undo
      setLastDeletedUser({
        id: userId,
        data: {
          color: userToDelete.color,
          name: userToDelete.name,
          lastSeen: userToDelete.lastSeen,
          isTyping: userToDelete.isTyping || false,
          editingTodoId: userToDelete.editingTodoId || null
        }
      })

      // Delete from Firebase
      const userPresenceRef = ref(db, `lists/${listId}/presence/${userId}`)
      await remove(userPresenceRef)

      // Show undo toast
      setToastMessage(`"${userName}" wurde entfernt`)
      setToastType('warning')
      setToastVisible(true)
    } catch (error) {
      console.error('Failed to delete user:', error)
      setToastMessage('Fehler beim Entfernen des Nutzers')
      setToastType('warning')
      setLastDeletedUser(null)
      setToastVisible(true)
    }
  }

  const handleUndoDelete = async () => {
    if (!lastDeletedUser || !isFirebaseConfigured() || !db) return

    try {
      // Restore user to Firebase
      const userPresenceRef = ref(db, `lists/${listId}/presence/${lastDeletedUser.id}`)
      await set(userPresenceRef, lastDeletedUser.data)

      setToastMessage('Nutzer wiederhergestellt')
      setToastType('success')
      setLastDeletedUser(null)
      setToastVisible(true)
    } catch (error) {
      console.error('Failed to restore user:', error)
      setToastMessage('Fehler beim Wiederherstellen')
      setToastType('warning')
      setLastDeletedUser(null)
      setToastVisible(true)
    }
  }

  const handleBulkCleanup = async () => {
    if (!isFirebaseConfigured() || !db) return

    const now = Date.now()
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)

    const oldUsers = allUsersList.filter(u => {
      if (!u.lastSeen || typeof u.lastSeen !== 'number') return false
      if (u.id === user?.uid) return false // Don't delete current user
      return u.lastSeen < sevenDaysAgo
    })

    if (oldUsers.length === 0) {
      setToastMessage('Keine alten Nutzer zum Aufräumen gefunden')
      setToastType('info')
      setToastVisible(true)
      return
    }

    try {
      const deletePromises = oldUsers.map(u => {
        const userPresenceRef = ref(db!, `lists/${listId}/presence/${u.id}`)
        return remove(userPresenceRef)
      })

      await Promise.all(deletePromises)

      setToastMessage(`${oldUsers.length} alte Nutzer wurden entfernt`)
      setToastType('success')
      setToastVisible(true)
    } catch (error) {
      console.error('Failed to cleanup old users:', error)
      setToastMessage('Fehler beim Aufräumen')
      setToastType('warning')
      setToastVisible(true)
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

              <Link
                href="/"
                className="flex items-center space-x-2 group cursor-pointer"
                title="Zur Startseite"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors duration-200">
                    <span className="font-black">mach<span className="text-pink-500">.</span>einfach</span> / Nutzer
                  </h1>
                  <p className="text-sm text-slate-500 font-mono">{listName}</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                {users.length} {users.length === 1 ? 'Nutzer' : 'Nutzer'}
              </Badge>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllUsers(!showAllUsers)}
                className={`${
                  showAllUsers
                    ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                    : 'bg-white text-slate-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                {showAllUsers ? 'Alle' : 'Aktive'}
              </Button>

              {/* Bulk Cleanup Button */}
              {showAllUsers && allUsersList.length > users.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkCleanup}
                  className="bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Aufräumen
                </Button>
              )}
            </div>
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
                              onChange={(e) => {
                                // Remove line breaks immediately while typing
                                const cleanedValue = e.target.value.replace(/[\r\n]+/g, ' ')
                                setEditingName(cleanedValue)
                              }}
                              onKeyDown={handleKeyPress}
                              className="font-semibold bg-white text-slate-800 px-3 py-1 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-sm min-w-32 whitespace-nowrap overflow-hidden text-ellipsis"
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
                            <h3 className="font-semibold text-slate-800 whitespace-nowrap">
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

                    {/* Delete Button - Only for offline users, not for current user */}
                    {!isCurrentUser(listUser.id) && !isOnline(listUser) && (
                      <button
                        onClick={() => handleDeleteUser(listUser.id, listUser.name)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Nutzer entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        onUndo={lastDeletedUser ? handleUndoDelete : undefined}
        undoText="Rückgängig"
      />
    </div>
  )
}
