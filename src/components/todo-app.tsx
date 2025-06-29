"use client"

import { useState, useEffect, useRef } from 'react'
import { 
  signInAnonymously, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  ref, 
  push, 
  onValue, 
  update, 
  remove,
  serverTimestamp,
  set,
  off
} from 'firebase/database'
import { Zap, Link } from 'lucide-react'

import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import { generateFunnyName, generateColor } from '@/lib/name-generator'
import { OfflineStorage } from '@/lib/offline-storage'
import { Todo, User } from '@/types/todo'

import UserAvatars from './user-avatars'
import TodoInput from './todo-input'
import TodoList from './todo-list'
import DebugPanel from './debug-panel'
import DeletedTodosTrash from './deleted-todos-trash'
import ToastNotification from './toast-notification'

interface TodoAppProps {
  listId: string
}

export default function TodoApp({ listId }: TodoAppProps) {
  // Firebase and Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  
  // App state
  const [todos, setTodos] = useState<Todo[]>([])
  const [deletedTodos, setDeletedTodos] = useState<Todo[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [copied, setCopied] = useState(false)
  const [userName, _setUserName] = useState('') // Renamed state setter
  const [firebaseStatus, setFirebaseStatus] = useState<string>('initializing')

  // Wrapper function to update state and localStorage
  const setUserName = (newName: string) => {
    const trimmedName = newName.trim()
    _setUserName(trimmedName)
    localStorage.setItem('macheinfach-username', trimmedName)
  }
  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('info')
  const [lastDeletedTodo, setLastDeletedTodo] = useState<Todo | null>(null)
  
  // Initialize offline storage
  const offlineStorage = new OfflineStorage(listId)
  
  // Use ref to ensure Firebase initialization only runs once (React StrictMode protection)
  const firebaseInitialized = useRef(false)

  // Initialize Firebase Authentication (Client-side only, using onAuthStateChanged)
  useEffect(() => {
    // Skip if already initialized (React StrictMode protection)
    if (firebaseInitialized.current) {
      return
    }
    
    firebaseInitialized.current = true
    
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return
    }
    
    const showFirebaseError = (reason: string, error?: any) => {
      console.error('❌ Firebase fehlt:', reason, error)
      setFirebaseStatus(`error: ${reason}`)
      // Zeige Fehlermeldung aber lade nicht die App
    }

    // Initialize Firebase with proper error handling
    const initFirebase = async () => {
      if (!isFirebaseConfigured() || !auth) {
        showFirebaseError('not-configured')
        return null
      }

      console.log('🔐 Initializing Firebase Auth...')
      setFirebaseStatus('connected')
      
      try {
        // Try to get current user first (synchronous)
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

        // No current user, try anonymous sign-in directly
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

        // Set up listener for future auth changes
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

    // Call async function and handle cleanup
    let cleanup: (() => void) | null = null
    
    initFirebase().then((cleanupFn) => {
      cleanup = cleanupFn
    })
    
    // Cleanup function
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

    const presenceRef = ref(db, `lists/${listId}/presence`)
    const userRef = ref(db, `lists/${listId}/presence/${user.uid}`)

    const userColor = generateColor(user.uid)
    const baseUserPresence = {
      color: userColor, 
      name: userName,
      isTyping: false,
      editingTodoId: null
    }
    
    // Function to update presence with current timestamp
    const updatePresence = () => {
      const userPresence = {
        ...baseUserPresence,
        onlineAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      }
      set(userRef, userPresence)
    }
    
    // Set initial presence
    updatePresence()
    
    // Set up heartbeat to continuously update presence every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (!document.hidden) {
        updatePresence()
      }
    }, 30000) // 30 seconds
    
    // Handle disconnect using visibility API (onDisconnect not available in web SDK)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        set(userRef, { 
          ...baseUserPresence, 
          lastSeen: serverTimestamp(), 
          onlineAt: null 
        })
      } else {
        updatePresence()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', () => {
      set(userRef, { 
        ...baseUserPresence, 
        lastSeen: serverTimestamp(), 
        onlineAt: null 
      })
    })
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const now = Date.now()
        const presentUsers = Object.keys(data)
          .map(userId => ({
            id: userId,
            ...data[userId]
          } as User))
          .filter(user => {
            // Only show users who are online or were online in the last 2 minutes
            const isOnline = user.onlineAt && typeof user.onlineAt === 'object'
            const lastSeen = user.lastSeen || user.onlineAt
            const lastSeenTime = typeof lastSeen === 'number' ? lastSeen : 0
            const timeSinceLastSeen = now - lastSeenTime
            return isOnline || timeSinceLastSeen < 2 * 60 * 1000 // 2 minutes
          })
          .sort((a, b) => {
            // Sort by online status first, then by last seen
            const aOnline = a.onlineAt && typeof a.onlineAt === 'object'
            const bOnline = b.onlineAt && typeof b.onlineAt === 'object'
            if (aOnline && !bOnline) return -1
            if (!aOnline && bOnline) return 1
            const aTime = typeof (a.lastSeen || a.onlineAt) === 'number' ? (a.lastSeen || a.onlineAt) : 0
            const bTime = typeof (b.lastSeen || b.onlineAt) === 'number' ? (b.lastSeen || b.onlineAt) : 0
            return (bTime as number) - (aTime as number)
          })
        
        presentUsers.forEach((user, index) => {
          user.zIndex = presentUsers.length - index
        })
        setUsers(presentUsers)
      } else {
        setUsers([])
      }
    })

    return () => {
      off(presenceRef, 'value', unsubscribe)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(heartbeatInterval)
    }
  }, [isAuthReady, user, userName, listId])

  // Real-time Todo Synchronization
  useEffect(() => {
    if (!isAuthReady || !user) return

    if (!isFirebaseConfigured() || !db) {
      console.error('❌ Firebase database not available for todo synchronization')
      return
    }

    const todosRef = ref(db, `lists/${listId}/todos`)

    const unsubscribe = onValue(todosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const allTodos = Object.keys(data)
          .map(todoId => ({
            id: todoId,
            ...data[todoId]
          } as Todo))
          .filter(todo => todo.text && todo.text.trim().length > 0) // Filter out empty todos
        
        // Separate active and deleted todos
        const activeTodos = allTodos
          .filter(todo => !todo.deletedAt)
          .sort((a, b) => {
            // Sort: incomplete todos first, then by creation time
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1
            }
            const aTime = typeof a.createdAt === 'number' ? a.createdAt : 0
            const bTime = typeof b.createdAt === 'number' ? b.createdAt : 0
            return aTime - bTime
          })
        
        const recentlyDeletedTodos = allTodos
          .filter(todo => todo.deletedAt)
          .sort((a, b) => {
            // Sort by deletion time, most recent first
            const aTime = typeof a.deletedAt === 'number' ? a.deletedAt : 0
            const bTime = typeof b.deletedAt === 'number' ? b.deletedAt : 0
            return (bTime as number) - (aTime as number)
          })
          .slice(0, 10) // Keep only last 10 deleted todos
        
        setTodos(activeTodos)
        setDeletedTodos(recentlyDeletedTodos)
        // Also save to offline storage as backup
        offlineStorage.saveTodos(activeTodos)
        console.log(`📝 Loaded ${activeTodos.length} active todos and ${recentlyDeletedTodos.length} deleted todos for list ${listId}`)
      } else {
        setTodos([])
        setDeletedTodos([])
        console.log(`📝 No todos found for list ${listId}`)
      }
    }, (error: any) => {
      console.error('❌ Error loading todos:', error)
      setFirebaseStatus(`error: ${error.code || error.message || 'database-read-failed'}`)
    })

    return () => off(todosRef, 'value', unsubscribe)
  }, [isAuthReady, user, listId])

  // Helper function to save todos locally as backup
  const saveTodosToStorage = (updatedTodos: Todo[]) => {
    offlineStorage.saveTodos(updatedTodos)
    setTodos(updatedTodos)
  }

  // CRUD Functions
  const handleAddTodo = async (text: string) => {
    if (!user || !isFirebaseConfigured() || !db) return
    
    const todosRef = ref(db, `lists/${listId}/todos`)
    await push(todosRef, {
      text,
      completed: false,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      creatorName: userName,
    })
  }

  const handleToggleTodo = async (id: string, completed: boolean) => {
    if (!isFirebaseConfigured() || !db) return

    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await update(todoRef, { completed })
  }
  
  const handleUpdateTodo = async (id: string, text: string) => {
    if (!isFirebaseConfigured() || !db) return

    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await update(todoRef, { text })
  }

  const handleDeleteTodo = async (id: string) => {
    if (!user || !isFirebaseConfigured() || !db) return
    
    const todoToDelete = todos.find(todo => todo.id === id)
    if (!todoToDelete) return
    
    // Store for undo functionality
    setLastDeletedTodo(todoToDelete)

    // Firebase - soft delete
    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await update(todoRef, { 
      deletedAt: serverTimestamp(),
      deletedBy: userName || user.uid
    })
    
    // Show undo toast
    setToastMessage(`"${todoToDelete.text}" wurde gelöscht`)
    setToastType('warning')
    setToastVisible(true)
  }

  const handleRestoreTodo = async (id: string) => {
    if (!isFirebaseConfigured() || !db) return

    // Firebase - restore todo
    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await update(todoRef, { 
      deletedAt: null,
      deletedBy: null
    })
  }

  const handlePermanentDelete = async (id: string) => {
    if (!isFirebaseConfigured() || !db) return

    // Firebase - permanently delete
    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await remove(todoRef)
  }

  const handleUndoDelete = async () => {
    if (!lastDeletedTodo) return
    
    // Restore the last deleted todo
    await handleRestoreTodo(lastDeletedTodo.id)
    setLastDeletedTodo(null)
    setToastVisible(false)
  }

  const handleEditingChange = async (todoId: string | null, isTyping: boolean) => {
    if (!user || !isFirebaseConfigured() || !db) return

    const userRef = ref(db, `lists/${listId}/presence/${user.uid}`)
    await update(userRef, {
      isTyping,
      editingTodoId: todoId,
      lastSeen: serverTimestamp()
    })
  }

  const handleDeleteAll = async () => {
    if (!isFirebaseConfigured() || !db) return

    // Firebase - permanently delete all todos in deletedTodos
    const deletePromises = deletedTodos.map(async (todo) => {
      const todoRef = ref(db!, `lists/${listId}/todos/${todo.id}`)
      return remove(todoRef)
    })
    
    await Promise.all(deletePromises)
    
    // Show success message
    setToastMessage(`${deletedTodos.length} Todo${deletedTodos.length !== 1 ? 's' : ''} endgültig gelöscht`)
    setToastType('success')
    setToastVisible(true)
  }

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-600">
          <Zap className="w-8 h-8 text-purple-500 animate-spin" />
          <span className="text-xl font-bold">Verbindung wird hergestellt...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-sans">
      {/* Full-width Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-3 md:px-8 py-2.5 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3 mb-3 sm:mb-0">
              <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded md:rounded-lg flex items-center justify-center shadow-md">
                <Zap className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">
                mach<span className="text-pink-500">.</span>einfach
              </h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <UserAvatars 
                users={users} 
                currentUserId={user?.uid}
                userName={userName}
                onNameChange={setUserName}
              />
              <button 
                onClick={copyLinkToClipboard}
                className="flex items-center space-x-1.5 md:space-x-2 bg-white px-2.5 py-1.5 md:px-4 md:py-2 rounded md:rounded-lg shadow-sm hover:shadow-md transition-shadow text-slate-600 font-semibold border border-gray-200 text-xs md:text-sm"
              >
                <Link className="w-4 h-4 md:w-5 md:h-5 text-blue-500"/>
                <span className="hidden sm:inline">{copied ? 'Kopiert!' : 'Teilen'}</span>
                <span className="sm:hidden">📋</span>
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
              : firebaseStatus === 'testing-connection'
              ? 'bg-blue-100 border-blue-500'
              : 'bg-yellow-100 border-yellow-500'
          }`}>
            <div className="flex items-center mb-2">
              <Zap className={`w-5 h-5 mr-2 ${
                firebaseStatus.startsWith('error') 
                  ? 'text-red-600' 
                  : firebaseStatus === 'testing-connection'
                  ? 'text-blue-600 animate-spin'
                  : 'text-yellow-600'
              }`} />
              <p className={`text-sm font-semibold ${
                firebaseStatus.startsWith('error') 
                  ? 'text-red-800' 
                  : firebaseStatus === 'testing-connection'
                  ? 'text-blue-800'
                  : 'text-yellow-800'
              }`}>
                {firebaseStatus === 'testing-connection' && 'Firebase wird getestet...'}
                {firebaseStatus === 'not-configured' && 'Firebase nicht konfiguriert'}
                {firebaseStatus === 'auth-failed' && 'Firebase Authentication fehlgeschlagen'}
                {firebaseStatus === 'auth-timeout' && 'Firebase Authentication Timeout'}
                {firebaseStatus === 'firebase-error' && 'Firebase Fehler'}
                {firebaseStatus.startsWith('error:') && `Firebase Fehler: ${firebaseStatus.split(':')[1]}`}
              </p>
            </div>
            {firebaseStatus !== 'testing-connection' && (
              <p className={`text-xs ${
                firebaseStatus.startsWith('error') 
                  ? 'text-red-700' 
                  : 'text-yellow-700'
              }`}>
                {firebaseStatus === 'not-configured' && 'Firebase ist nicht konfiguriert. Überprüfe die Umgebungsvariablen.'}
                {firebaseStatus === 'auth-failed' && 'Firebase Anonymous Authentication ist nicht aktiviert. Siehe FIREBASE_SETUP.md'}
                {firebaseStatus === 'auth-timeout' && 'Firebase Authentication dauerte zu lange. Netzwerkverbindung prüfen.'}
                {firebaseStatus === 'firebase-error' && 'Detaillierte Fehlerinfo in der Browser-Konsole verfügbar.'}
                {firebaseStatus.startsWith('error:') && 'Überprüfe Firebase Console und FIREBASE_SETUP.md für Lösungsschritte.'}
              </p>
            )}
          </div>
        )}

        {/* Add Todo Form */}
        <TodoInput onAddTodo={handleAddTodo} />

        {/* Todo List */}
        <TodoList 
          todos={todos}
          users={users}
          currentUserId={user?.uid}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          onUpdateTodo={handleUpdateTodo}
          onEditingChange={handleEditingChange}
        />

      </div>

      {/* Deleted Todos Trash */}
      <DeletedTodosTrash
        deletedTodos={deletedTodos}
        onRestoreTodo={handleRestoreTodo}
        onPermanentDelete={handlePermanentDelete}
        onDeleteAll={handleDeleteAll}
      />

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        onUndo={lastDeletedTodo ? handleUndoDelete : undefined}
        undoText="Wiederherstellen"
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