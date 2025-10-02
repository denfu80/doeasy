"use client"

import { useState, useEffect, useRef } from 'react'
import {
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import {
  ref,
  onValue,
  serverTimestamp,
  set,
  off,
  get,
  update
} from 'firebase/database'
import { Zap, Eye, ArrowLeft, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { filterUsersByTime, sortUsersByLastSeen } from '@/lib/presence-utils'

import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import { generateFunnyName, generateColor } from '@/lib/name-generator'
import { Todo, User, GuestLink, PasswordSettings } from '@/types/todo'

import UserAvatars from './user-avatars'
import DebugPanel from './debug-panel'
import ToastNotification from './toast-notification'
import PasswordPrompt from './password-prompt'

interface GuestTodoAppProps {
  listId: string
  guestId: string
}

export default function GuestTodoApp({ listId, guestId }: GuestTodoAppProps) {
  const router = useRouter()

  // Firebase and Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  // App state
  const [todos, setTodos] = useState<Todo[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userName, _setUserName] = useState('')
  const [firebaseStatus, setFirebaseStatus] = useState<string>('initializing')
  const [listName, setListName] = useState('')
  const [guestLink, setGuestLink] = useState<GuestLink | null>(null)
  const [isValidGuestLink, setIsValidGuestLink] = useState<boolean | null>(null)

  // Password protection state
  const [passwordSettings, setPasswordSettings] = useState<PasswordSettings>({
    enabledModes: {
      adminPasswordEnabled: false,
      normalPasswordEnabled: false,
      guestPasswordEnabled: false
    }
  })
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean | null>(null)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [isCheckingPassword, setIsCheckingPassword] = useState(false)
  const [hasValidPassword, setHasValidPassword] = useState(false)

  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('info')

  // Wrapper function to update state and localStorage
  const setUserName = (newName: string) => {
    const trimmedName = newName.trim()
    _setUserName(trimmedName)
    localStorage.setItem('macheinfach-username', trimmedName)
  }

  // Use ref to ensure Firebase initialization only runs once
  const firebaseInitialized = useRef(false)

  // Initialize Firebase Authentication
  useEffect(() => {
    if (firebaseInitialized.current) return
    firebaseInitialized.current = true

    if (typeof window === 'undefined') return

    const showFirebaseError = (reason: string, error?: unknown) => {
      console.error('❌ Firebase fehlt:', reason, error)
      setFirebaseStatus(`error: ${reason}`)
    }

    const initFirebase = async () => {
      if (!isFirebaseConfigured() || !auth) {
        showFirebaseError('not-configured')
        return null
      }

      console.log('🔐 Initializing Firebase Auth for Guest...')
      setFirebaseStatus('connected')

      try {
        if (auth.currentUser) {
          console.log('✅ User already authenticated:', auth.currentUser.uid)
          setUser(auth.currentUser)
          let savedName = localStorage.getItem('macheinfach-username')
          if (!savedName) {
            savedName = generateFunnyName()
            localStorage.setItem('macheinfach-username', savedName)
          }
          _setUserName(savedName)
          setIsAuthReady(true)
          return null
        }

        console.log('🔐 No current user, attempting anonymous sign-in...')
        const userCredential = await signInAnonymously(auth)
        console.log('✅ Anonymous sign-in successful:', userCredential.user.uid)

        setUser(userCredential.user)
        let savedName = localStorage.getItem('macheinfach-username')
        if (!savedName) {
          savedName = generateFunnyName()
          localStorage.setItem('macheinfach-username', savedName)
        }
        _setUserName(savedName)
        setIsAuthReady(true)

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser && firebaseUser.uid !== userCredential.user.uid) {
            console.log('🔄 Auth state changed to new user:', firebaseUser.uid)
            setUser(firebaseUser)
          }
        })

        return unsubscribe
      } catch (error) {
        showFirebaseError('auth-failed', error)
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

  // Load password settings and validate guest link
  useEffect(() => {
    if (!isAuthReady || !isFirebaseConfigured() || !db) return

    const validateGuestLink = async () => {
      try {
        const guestLinkRef = ref(db!, `lists/${listId}/guestLinks/${guestId}`)
        const snapshot = await get(guestLinkRef)

        if (snapshot.exists()) {
          const linkData = snapshot.val() as GuestLink

          // Check if link is revoked
          if (linkData.revoked) {
            setIsValidGuestLink(false)
            setToastMessage('Dieser Gast-Link wurde widerrufen')
            setToastType('warning')
            setToastVisible(true)
            return
          }

          setGuestLink({ ...linkData, id: guestId })
          setIsValidGuestLink(true)
        } else {
          setIsValidGuestLink(false)
          setToastMessage('Gast-Link nicht gefunden')
          setToastType('warning')
          setToastVisible(true)
        }
      } catch (error) {
        console.error('Error validating guest link:', error)
        setIsValidGuestLink(false)
        setToastMessage('Fehler beim Laden des Gast-Links')
        setToastType('warning')
        setToastVisible(true)
      }
    }

    // Load password settings
    const passwordsRef = ref(db!, `lists/${listId}/passwords`)
    const unsubscribePasswords = onValue(passwordsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setPasswordSettings(data as PasswordSettings)
        // Check if guest password protection is enabled
        const isProtected = data.enabledModes?.guestPasswordEnabled === true
        setIsPasswordProtected(isProtected)

        // If password protection is enabled and we don't have a valid password, show prompt
        if (isProtected && !hasValidPassword) {
          setShowPasswordPrompt(true)
        }
      } else {
        setPasswordSettings({
          enabledModes: {
            adminPasswordEnabled: false,
            normalPasswordEnabled: false,
            guestPasswordEnabled: false
          }
        })
        setIsPasswordProtected(false)
      }
    })

    validateGuestLink()

    return () => off(passwordsRef, 'value', unsubscribePasswords)
  }, [isAuthReady, listId, guestId, hasValidPassword])

  // Load list name from Firebase
  useEffect(() => {
    if (!isAuthReady || !isValidGuestLink || !isFirebaseConfigured() || !db) return

    const listNameRef = ref(db!, `lists/${listId}/metadata/name`)

    const unsubscribe = onValue(listNameRef, (snapshot) => {
      const name = snapshot.val()
      setListName(name || listId)
    })

    return () => off(listNameRef, 'value', unsubscribe)
  }, [listId, isAuthReady, isValidGuestLink])

  // Real-time Presence Tracking (readonly)
  useEffect(() => {
    if (!isAuthReady || !user || !userName || !isValidGuestLink) return

    if (!isFirebaseConfigured() || !db) {
      console.error('❌ Firebase database not available for presence tracking')
      return
    }

    const presenceRef = ref(db!, `lists/${listId}/presence`)
    const userRef = ref(db!, `lists/${listId}/presence/${user.uid}`)

    const userColor = generateColor(user.uid)
    const baseUserPresence = {
      color: userColor,
      name: `${userName} (Gast)`,
      isTyping: false,
      editingTodoId: null
    }

    // Set guest presence
    const updatePresence = async () => {
      const userPresence = {
        ...baseUserPresence,
        lastSeen: serverTimestamp()
      }

      try {
        await set(userRef, userPresence)
        console.log('✅ Guest presence updated successfully')
      } catch (error: any) {
        console.error('❌ Guest presence update failed:', error.code, error.message)
      }
    }

    setTimeout(updatePresence, 100)

    const heartbeatInterval = setInterval(() => {
      if (!document.hidden) {
        updatePresence()
      }
    }, 30000)

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

    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const allUsers = Object.keys(data)
          .map(userId => ({
            id: userId,
            ...data[userId]
          } as User))

        // Filter users active within last 5 minutes (default OFFLINE_THRESHOLD)
        const activeUsers = filterUsersByTime(allUsers)

        // Sort by last seen time (most recent first)
        const sortedUsers = sortUsersByLastSeen(activeUsers)

        // Assign z-index for stacking order
        sortedUsers.forEach((user, index) => {
          user.zIndex = sortedUsers.length - index
        })

        setUsers(sortedUsers)
      } else {
        setUsers([])
      }
    })

    return () => {
      off(presenceRef, 'value', unsubscribe)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(heartbeatInterval)
    }
  }, [isAuthReady, user, userName, listId, isValidGuestLink])

  // Real-time Todo Synchronization (with guest completion)
  useEffect(() => {
    if (!isAuthReady || !user || !isValidGuestLink) return

    if (!isFirebaseConfigured() || !db) {
      console.error('❌ Firebase database not available for todo synchronization')
      return
    }

    const todosRef = ref(db!, `lists/${listId}/todos`)

    const unsubscribe = onValue(todosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const allTodos = Object.keys(data)
          .map(todoId => ({
            id: todoId,
            ...data[todoId]
          } as Todo))
          .filter(todo => todo.text && todo.text.trim().length > 0)

        const activeTodos = allTodos
          .filter(todo => !todo.deletedAt)
          .sort((a, b) => {
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1
            }
            const aTime = typeof a.createdAt === 'number' ? a.createdAt : 0
            const bTime = typeof b.createdAt === 'number' ? b.createdAt : 0
            return aTime - bTime
          })

        setTodos(activeTodos)
        console.log(`📝 Guest loaded ${activeTodos.length} todos for list ${listId}`)
      } else {
        setTodos([])
        console.log(`📝 No todos found for list ${listId}`)
      }
    }, (error: unknown) => {
      console.error('❌ Error loading todos:', error)
      const errorMessage = error instanceof Error ? error.message : 'database-read-failed'
      setFirebaseStatus(`error: ${errorMessage}`)
    })

    return () => off(todosRef, 'value', unsubscribe)
  }, [isAuthReady, user, listId, isValidGuestLink])

  // Guest Todo Completion Handler
  const handleToggleComplete = async (todoId: string, currentCompleted: boolean) => {
    if (!user || !isFirebaseConfigured() || !db) return

    try {
      const todoRef = ref(db!, `lists/${listId}/todos/${todoId}`)
      console.log(`🔄 Guest toggling todo ${todoId} to ${!currentCompleted ? 'completed' : 'uncompleted'}`)
      await update(todoRef, {
        completed: !currentCompleted,
        completedAt: !currentCompleted ? serverTimestamp() : null,
        completedBy: !currentCompleted ? user.uid : null
      })

      console.log(`${!currentCompleted ? '✅' : '⏹️'} Guest ${!currentCompleted ? 'completed' : 'uncompleted'} todo: ${todoId}`)
    } catch (error) {
      console.error('❌ Error toggling todo completion:', error)
      setToastMessage('Fehler beim Aktualisieren der Aufgabe')
      setToastType('warning')
      setToastVisible(true)
    }
  }

  // Handle back navigation
  const handleBackToList = () => {
    router.push(`/list/${listId}`)
  }

  // Password validation functions
  const handlePasswordSubmit = async (password: string) => {
    setIsCheckingPassword(true)
    setPasswordError('')

    try {
      // Check if the entered password matches the stored guest password
      if (password === passwordSettings.guestPassword) {
        setHasValidPassword(true)
        setShowPasswordPrompt(false)
        setPasswordError('')

        // Store password validation in sessionStorage to persist during session
        sessionStorage.setItem(`guest-password-validated-${listId}`, 'true')
      } else {
        setPasswordError('Falsches Passwort')
      }
    } catch (error) {
      setPasswordError('Fehler beim Überprüfen des Passworts')
    } finally {
      setIsCheckingPassword(false)
    }
  }

  const handlePasswordCancel = () => {
    // Redirect to homepage when password is cancelled
    window.location.href = '/'
  }

  // Check if password was already validated in this session
  useEffect(() => {
    const wasValidated = sessionStorage.getItem(`guest-password-validated-${listId}`) === 'true'
    if (wasValidated) {
      setHasValidPassword(true)
    }
  }, [listId])

  // Show password prompt if password protection is enabled and no valid password
  if (isPasswordProtected && !hasValidPassword && showPasswordPrompt) {
    return (
      <PasswordPrompt
        listName={listName || listId}
        requiredRole="guest"
        onPasswordSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        error={passwordError}
        isLoading={isCheckingPassword}
      />
    )
  }

  // Loading state
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-600">
          <Zap className="w-8 h-8 text-purple-500 animate-spin" />
          <span className="text-xl font-bold">Gast-Zugang wird geladen...</span>
        </div>
      </div>
    )
  }

  // Invalid guest link
  if (isValidGuestLink === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Gast-Link ungültig</h1>
          <p className="text-slate-600 mb-4">Dieser Link ist nicht verfügbar oder wurde widerrufen.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    )
  }

  // Valid guest access
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-sans">
      {/* Full-width Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-3 md:px-8 py-2.5 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3 mb-3 sm:mb-0">
              <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded md:rounded-lg flex items-center justify-center shadow-md">
                <Eye className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">
                  mach<span className="text-pink-500">.</span>einfach
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm md:text-base text-purple-600 font-bold">
                    {listName} (readonly)
                  </span>
                  <p className="text-xs text-slate-400 font-mono hidden sm:block">
                    readonly access
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <UserAvatars
                users={users}
                currentUserId={user?.uid}
                userName={userName}
                onNameChange={setUserName}
                listId={listId}
              />
              <button
                onClick={handleBackToList}
                className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border bg-white text-slate-500 border-gray-200 hover:bg-gray-50"
                title="Zur normalen Ansicht"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area - Constrained */}
      <div className="container mx-auto max-w-3xl p-3 md:p-8">
        {/* Firebase Status Notice */}
        {firebaseStatus !== 'connected' && (
          <div className={`mb-3 md:mb-6 p-3 md:p-4 rounded-lg border-l-4 ${
            firebaseStatus.startsWith('error') 
              ? 'bg-red-100 border-red-500' 
              : 'bg-yellow-100 border-yellow-500'
          }`}>
            <div className="flex items-center mb-2">
              <Zap className={`w-5 h-5 mr-2 ${
                firebaseStatus.startsWith('error') 
                  ? 'text-red-600' 
                  : 'text-yellow-600'
              }`} />
              <p className={`text-sm font-semibold ${
                firebaseStatus.startsWith('error') 
                  ? 'text-red-800' 
                  : 'text-yellow-800'
              }`}>
                {firebaseStatus.startsWith('error') && `Firebase Fehler: ${firebaseStatus.split(':')[1]}`}
              </p>
            </div>
          </div>
        )}

        {/* Guest Notice */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800">Gast-Zugang</h3>
              <p className="text-sm text-purple-600">
                Du kannst Todos ansehen und abhaken. Klicke auf eine Aufgabe um sie zu erledigen.
              </p>
            </div>
          </div>
        </div>

        {/* Todo List (readonly) */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Liste ist leer</h2>
              <p className="text-slate-600">Es wurden noch keine Aufgaben hinzugefügt.</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer ${
                  todo.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-purple-200'
                }`}
                onClick={() => handleToggleComplete(todo.id, todo.completed)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 hover:border-purple-400'
                  }`}>
                    {todo.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <p className={`flex-1 select-none ${
                    todo.completed 
                      ? 'line-through text-green-700' 
                      : 'text-slate-800'
                  }`}>
                    {todo.text}
                  </p>
                  <div className="text-xs text-slate-400">
                    von {todo.creatorName}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel
          firebaseStatus={firebaseStatus}
          user={user}
          listId={listId}
          todos={todos}
          users={users}
        />
      )}
    </div>
  )
}
