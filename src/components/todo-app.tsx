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
import { generateFunnyName, generateColor } from '@/lib/name-generator'
import { Todo, User } from '@/types/todo'

import UserAvatars from './user-avatars'
import TodoInput from './todo-input'
import TodoList from './todo-list'
import UserNameEditor from './user-name-editor'

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

  // Initialize Firebase Authentication
  useEffect(() => {
    const setupDemoMode = () => {
      const demoUserId = 'demo-user-' + Math.random().toString(36).substring(2, 12)
      setUser({ uid: demoUserId } as any)
      let savedName = localStorage.getItem('machhalt-username')
      if (!savedName) {
        savedName = generateFunnyName()
        localStorage.setItem('machhalt-username', savedName)
      }
      setUserName(savedName)
      setIsAuthReady(true)
    }

    // Check if Firebase is properly configured and initialized
    if (!isFirebaseConfigured() || !auth) {
      console.log('🔧 Setting up demo mode - Firebase not available')
      setupDemoMode()
      return
    }

    console.log('🔥 Attempting Firebase authentication...')
    
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
          await signInAnonymously(auth)
        } catch (error) {
          console.error("❌ Authentication failed - falling back to demo mode:", error)
          setupDemoMode()
        }
      }
    })

    return () => unsubscribe()
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
    set(userRef, { 
      onlineAt: serverTimestamp(), 
      color: userColor, 
      name: userName 
    })
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const presentUsers = Object.keys(data).map(userId => ({
          id: userId,
          ...data[userId]
        } as User)).sort((a, b) => 
          (a.onlineAt || 0) - (b.onlineAt || 0)
        )
        
        presentUsers.forEach((user, index) => {
          user.zIndex = presentUsers.length - index
        })
        setUsers(presentUsers)
      } else {
        setUsers([])
      }
    })

    return () => off(presenceRef, 'value', unsubscribe)
  }, [isAuthReady, user, userName, listId])

  // Real-time Todo Synchronization
  useEffect(() => {
    if (!isAuthReady || !user) return

    if (!isFirebaseConfigured() || !db) {
      // Demo mode - load todos from localStorage
      const savedTodos = localStorage.getItem(`machhalt-todos-${listId}`)
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos))
      }
      return
    }

    const todosRef = ref(db, `lists/${listId}/todos`)

    const unsubscribe = onValue(todosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const todosData = Object.keys(data).map(todoId => ({
          id: todoId,
          ...data[todoId]
        } as Todo)).sort((a, b) => 
          (a.createdAt || 0) - (b.createdAt || 0)
        )
        setTodos(todosData)
      } else {
        setTodos([])
      }
    })

    return () => off(todosRef, 'value', unsubscribe)
  }, [isAuthReady, user, listId])

  // Helper function to save todos to localStorage in demo mode
  const saveTodosToStorage = (updatedTodos: Todo[]) => {
    localStorage.setItem(`machhalt-todos-${listId}`, JSON.stringify(updatedTodos))
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
        {/* Firebase Configuration Notice */}
        {user?.uid?.startsWith('demo-user-') && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-center mb-2">
              <Zap className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800 font-semibold">
                Demo Modus aktiv
              </p>
            </div>
            <p className="text-xs text-yellow-700">
              {isFirebaseConfigured() 
                ? "Firebase Anonymous Authentication ist nicht aktiviert. Aktiviere es in der Firebase Console unter Authentication → Sign-in method → Anonymous."
                : "Firebase ist nicht konfiguriert. Todos werden lokal gespeichert."
              }
            </p>
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
    </div>
  )
}