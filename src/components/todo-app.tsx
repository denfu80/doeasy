"use client"

import { useState, useEffect } from 'react'
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
import { testFirebaseConnection } from '@/lib/firebase-test'
import { generateFunnyName, generateColor } from '@/lib/name-generator'
import { OfflineStorage } from '@/lib/offline-storage'
import { Todo, User } from '@/types/todo'

import UserAvatars from './user-avatars'
import TodoInput from './todo-input'
import TodoList from './todo-list'
import UserNameEditor from './user-name-editor'
import DebugPanel from './debug-panel'

interface TodoAppProps {
  listId: string
}

export default function TodoApp({ listId }: TodoAppProps) {
  // Firebase and Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  
  // App state
  const [todos, setTodos] = useState<Todo[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [copied, setCopied] = useState(false)
  const [userName, setUserName] = useState('')
  const [firebaseStatus, setFirebaseStatus] = useState<string>('initializing')
  
  // Initialize offline storage
  const offlineStorage = new OfflineStorage(listId)

  // Initialize Firebase Authentication
  useEffect(() => {
    const setupDemoMode = (reason?: string) => {
      const demoUserId = 'demo-user-' + Math.random().toString(36).substring(2, 12)
      setUser({ uid: demoUserId } as FirebaseUser)
      let savedName = localStorage.getItem('machhalt-username')
      if (!savedName) {
        savedName = generateFunnyName()
        localStorage.setItem('machhalt-username', savedName)
      }
      setUserName(savedName)
      setIsAuthReady(true)
      setFirebaseStatus(reason || 'demo-mode')
    }

    // Test Firebase connection first
    const initFirebase = async () => {
      if (!isFirebaseConfigured() || !auth) {
        console.log('🔧 Setting up demo mode - Firebase not available')
        setupDemoMode('not-configured')
        return
      }

      console.log('🔥 Testing Firebase connection...')
      setFirebaseStatus('testing-connection')
      
      const testResult = await testFirebaseConnection()
      console.log('Firebase test result:', testResult)
      
      if (testResult.error) {
        console.log('❌ Firebase test failed:', testResult.error)
        setFirebaseStatus(`error: ${testResult.error}`)
        setupDemoMode('firebase-error')
        return
      }

      console.log('✅ Firebase connection successful')
      setFirebaseStatus('connected')
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          console.log('✅ User authenticated:', firebaseUser.uid)
          setUser(firebaseUser)
          let savedName = localStorage.getItem('machhalt-username')
          if (!savedName) {
            savedName = generateFunnyName()
            localStorage.setItem('machhalt-username', savedName)
          }
          setUserName(savedName)
          setIsAuthReady(true)
        } else {
          try {
            console.log('🔐 Attempting anonymous sign-in...')
            if (auth) {
              await signInAnonymously(auth)
            }
          } catch (error) {
            console.error("❌ Authentication failed - falling back to demo mode:", error)
            setupDemoMode('auth-failed')
          }
        }
      })

      return () => unsubscribe()
    }

    initFirebase()
  }, [])

  // Real-time Presence Tracking
  useEffect(() => {
    if (!isAuthReady || !user || !userName) return

    if (!isFirebaseConfigured() || !db) {
      // Demo mode - show only current user
      const demoUser: User = {
        id: user.uid,
        name: userName,
        color: generateColor(user.uid),
        onlineAt: new Date() as any,
        zIndex: 1
      }
      setUsers([demoUser])
      return
    }

    const presenceRef = ref(db, `lists/${listId}/presence`)
    const userRef = ref(db, `lists/${listId}/presence/${user.uid}`)

    const userColor = generateColor(user.uid)
    const userPresence = {
      onlineAt: serverTimestamp(), 
      color: userColor, 
      name: userName,
      lastSeen: serverTimestamp(),
      isTyping: false
    }
    
    // Set user presence and handle disconnect
    set(userRef, userPresence)
    
    // Handle disconnect using visibility API (onDisconnect not available in web SDK)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        set(userRef, { ...userPresence, lastSeen: serverTimestamp(), onlineAt: null })
      } else {
        set(userRef, userPresence)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', () => {
      set(userRef, { ...userPresence, lastSeen: serverTimestamp(), onlineAt: null })
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
            // Only show users who are online or were online in the last 5 minutes
            const isOnline = user.onlineAt && typeof user.onlineAt === 'object'
            const lastSeen = user.lastSeen || user.onlineAt
            const lastSeenTime = typeof lastSeen === 'number' ? lastSeen : 0
            const timeSinceLastSeen = now - lastSeenTime
            return isOnline || timeSinceLastSeen < 5 * 60 * 1000 // 5 minutes
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
    }
  }, [isAuthReady, user, userName, listId])

  // Real-time Todo Synchronization
  useEffect(() => {
    if (!isAuthReady || !user) return

    if (!isFirebaseConfigured() || !db) {
      // Demo mode - load todos from offline storage
      const savedTodos = offlineStorage.loadTodos()
      setTodos(savedTodos)
      console.log(`📂 Demo mode: loaded ${savedTodos.length} todos from offline storage`)
      return
    }

    const todosRef = ref(db, `lists/${listId}/todos`)

    const unsubscribe = onValue(todosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const todosData = Object.keys(data)
          .map(todoId => ({
            id: todoId,
            ...data[todoId]
          } as Todo))
          .filter(todo => todo.text && todo.text.trim().length > 0) // Filter out empty todos
          .sort((a, b) => {
            // Sort: incomplete todos first, then by creation time
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1
            }
            const aTime = typeof a.createdAt === 'number' ? a.createdAt : 0
            const bTime = typeof b.createdAt === 'number' ? b.createdAt : 0
            return aTime - bTime
          })
        
        setTodos(todosData)
        // Also save to offline storage as backup
        offlineStorage.saveTodos(todosData)
        console.log(`📝 Loaded ${todosData.length} todos for list ${listId}`)
      } else {
        setTodos([])
        console.log(`📝 No todos found for list ${listId}`)
      }
    }, (error: any) => {
      console.error('❌ Error loading todos:', error)
      setFirebaseStatus(`error: ${error.code || error.message || 'database-read-failed'}`)
    })

    return () => off(todosRef, 'value', unsubscribe)
  }, [isAuthReady, user, listId])

  // Helper function to save todos to offline storage in demo mode
  const saveTodosToStorage = (updatedTodos: Todo[]) => {
    offlineStorage.saveTodos(updatedTodos)
    setTodos(updatedTodos)
  }

  // CRUD Functions
  const handleAddTodo = async (text: string) => {
    if (!user) return
    
    if (!isFirebaseConfigured() || !db) {
      // Demo mode - use localStorage
      const newTodo: Todo = {
        id: Math.random().toString(36).substring(2, 12),
        text,
        completed: false,
        createdAt: Date.now() as any,
        createdBy: user.uid,
        creatorName: userName,
      }
      const updatedTodos = [...todos, newTodo]
      saveTodosToStorage(updatedTodos)
      return
    }
    
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
    if (!isFirebaseConfigured() || !db) {
      // Demo mode - update localStorage
      const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, completed } : todo
      )
      saveTodosToStorage(updatedTodos)
      return
    }

    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await update(todoRef, { completed })
  }
  
  const handleUpdateTodo = async (id: string, text: string) => {
    if (!isFirebaseConfigured() || !db) {
      // Demo mode - update localStorage
      const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, text } : todo
      )
      saveTodosToStorage(updatedTodos)
      return
    }

    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await update(todoRef, { text })
  }

  const handleDeleteTodo = async (id: string) => {
    if (!isFirebaseConfigured() || !db) {
      // Demo mode - update localStorage
      const updatedTodos = todos.filter(todo => todo.id !== id)
      saveTodosToStorage(updatedTodos)
      return
    }

    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await remove(todoRef)
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
      <div className="container mx-auto max-w-3xl p-4 md:p-8">
        {/* Firebase Status Notice */}
        {firebaseStatus !== 'connected' && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
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
                {firebaseStatus === 'not-configured' && 'Demo Modus: Firebase nicht konfiguriert'}
                {firebaseStatus === 'auth-failed' && 'Demo Modus: Authentication fehlgeschlagen'}
                {firebaseStatus === 'firebase-error' && 'Demo Modus: Firebase Fehler'}
                {firebaseStatus.startsWith('error:') && `Firebase Fehler: ${firebaseStatus.split(':')[1]}`}
              </p>
            </div>
            {firebaseStatus !== 'testing-connection' && (
              <p className={`text-xs ${
                firebaseStatus.startsWith('error') 
                  ? 'text-red-700' 
                  : 'text-yellow-700'
              }`}>
                {firebaseStatus === 'not-configured' && 'Firebase ist nicht konfiguriert. Todos werden lokal gespeichert.'}
                {firebaseStatus === 'auth-failed' && 'Firebase Anonymous Authentication ist nicht aktiviert. Siehe FIREBASE_SETUP.md'}
                {firebaseStatus === 'firebase-error' && 'Detaillierte Fehlerinfo in der Browser-Konsole verfügbar.'}
                {firebaseStatus.startsWith('error:') && 'Überprüfe Firebase Console und FIREBASE_SETUP.md für Lösungsschritte.'}
              </p>
            )}
          </div>
        )}
        
        {/* Success Notice */}
        {firebaseStatus === 'connected' && !user?.uid?.startsWith('demo-user-') && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800 font-semibold">
                ✅ Firebase Realtime Database aktiv - Real-time Kollaboration verfügbar!
              </p>
            </div>
          </div>
        )}
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              mach<span className="text-pink-500">.</span>halt
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <UserAvatars users={users} />
            <button 
              onClick={copyLinkToClipboard}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow text-slate-600 font-semibold"
            >
              <Link className="w-5 h-5 text-blue-500"/>
              <span>{copied ? 'Kopiert!' : 'Teilen'}</span>
            </button>
          </div>
        </header>

        {/* Add Todo Form */}
        <TodoInput onAddTodo={handleAddTodo} />

        {/* Todo List */}
        <TodoList 
          todos={todos}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          onUpdateTodo={handleUpdateTodo}
        />

        {/* Footer */}
        <UserNameEditor userName={userName} setUserName={setUserName} />
      </div>

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