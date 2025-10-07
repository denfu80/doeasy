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
import { Zap, Link as LinkIcon, Edit2, Check, X, Pin, Lock, Unlock } from 'lucide-react'
import Link from 'next/link'
import { sortUsersByLastSeen, isUserOnline } from '@/lib/presence-utils'

import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import { generateFunnyName, generateColor } from '@/lib/name-generator'
import { OfflineStorage, getLocalListIds, addLocalListId, removeLocalListId } from '@/lib/offline-storage'
import { Todo, User, GuestLink, UserRole, ListPassword } from '@/types/todo'

import UserAvatars from './user-avatars'
import TodoInput from './todo-input'
import TodoList from './todo-list'
import ListDescription from './list-description'
import DeletedTodosTrash from './deleted-todos-trash'
import ToastNotification from './toast-notification'
import SharingModal from './sharing-modal'
import HeaderActionsMenu from './header-actions-menu'
import ConfirmDialog from './confirm-dialog'
import PasswordPrompt from './password-prompt'

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
  // Remove unused copied state since we're using sharing modal instead
  const [userName, _setUserName] = useState('') // Renamed state setter
  const [firebaseStatus, setFirebaseStatus] = useState<string>('initializing')
  
  // List name editing state
  const [listName, setListName] = useState('')
  const [isEditingListName, setIsEditingListName] = useState(false)
  const [editingListNameValue, setEditingListNameValue] = useState('')

  // List description state
  const [listDescription, setListDescription] = useState('')

  // Pin state
  const [isPinned, setIsPinned] = useState(false)
  const [hasShownPinHint, setHasShownPinHint] = useState(false)
  const [hasShownNameHint, setHasShownNameHint] = useState(false)

  // Password protection state
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [passwordMode, setPasswordMode] = useState<'set' | 'verify' | 'remove'>('set')
  const [passwordError, setPasswordError] = useState<string>('')
  const [hasShownPasswordHint, setHasShownPasswordHint] = useState(false)

  // Sharing state
  const [showSharingModal, setShowSharingModal] = useState(false)
  const [guestLinks, setGuestLinks] = useState<GuestLink[]>([])

  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingToggle, setPendingToggle] = useState<{ id: string, completed: boolean } | null>(null)

  // Wrapper function to update state and localStorage
  const setUserName = (newName: string) => {
    const trimmedName = newName.trim()
    _setUserName(trimmedName)
    localStorage.setItem('macheinfach-username', trimmedName)
    localStorage.setItem('macheinfach-username-customized', 'true')
    setHasShownNameHint(false)
  }
  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('info')
  const [lastDeletedTodo, setLastDeletedTodo] = useState<Todo | null>(null)
  
  // Initialize offline storage
  const offlineStorage = new OfflineStorage(listId)
  
  // Load list name and description from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured() || !db) return

    const listNameRef = ref(db!, `lists/${listId}/metadata/name`)
    const listDescriptionRef = ref(db!, `lists/${listId}/metadata/description`)

    const nameUnsubscribe = onValue(listNameRef, (snapshot) => {
      const name = snapshot.val()
      setListName(name || listId)
    })

    const descriptionUnsubscribe = onValue(listDescriptionRef, (snapshot) => {
      const description = snapshot.val()
      setListDescription(description || '')
    })

    return () => {
      off(listNameRef, 'value', nameUnsubscribe)
      off(listDescriptionRef, 'value', descriptionUnsubscribe)
    }
  }, [listId])

  // Check if list is pinned and show pin hint if needed
  useEffect(() => {
    const localLists = getLocalListIds()
    const isListPinned = localLists.includes(listId)
    setIsPinned(isListPinned)
    
    // Check if we should show pin hint
    const pinHintKey = `pin-hint-shown-${listId}`
    const hasShownHintBefore = localStorage.getItem(pinHintKey) === 'true'
    
    // Show hint if: list is not pinned, user is authenticated, and we haven't shown it before
    if (!isListPinned && !hasShownHintBefore && isAuthReady) {
      // Delay to let the UI settle first
      setTimeout(() => {
        setToastMessage('💡 Tipp: Pinne diese Liste, um sie schnell wiederzufinden!')
        setToastType('info')
        setToastVisible(true)
        setHasShownPinHint(true)
        localStorage.setItem(pinHintKey, 'true')
        
        // Auto-stop pulsing after 8 seconds
        setTimeout(() => {
          setHasShownPinHint(false)
        }, 8000)
      }, 0)
    }
  }, [listId, isAuthReady])

  // Show name hint once per list (if user still has a generated name)
  useEffect(() => {
    const nameHintKey = `name-hint-shown-${listId}`
    const hasShownHintBefore = localStorage.getItem(nameHintKey) === 'true'
    const hasCustomName = localStorage.getItem('macheinfach-username-customized') === 'true'

    // Show hint if: user has not customized their name yet and we haven't shown it before
    if (!hasCustomName && !hasShownHintBefore && isAuthReady && userName) {
      // Delay to let the UI settle and avoid collision with pin hint
      setTimeout(() => {
        setToastMessage('✨ Tipp: Hover über deinen Avatar, um deinen Namen anzupassen!')
        setToastType('info')
        setToastVisible(true)
        setHasShownNameHint(true)
        localStorage.setItem(nameHintKey, 'true')

        // Auto-stop pulsing after 8 seconds
        setTimeout(() => {
          setHasShownNameHint(false)
        }, 8000)
      }, 5000)
    }
  }, [listId, isAuthReady, userName])

  // Load password protection status and check if unlocked
  useEffect(() => {
    if (!isFirebaseConfigured() || !db || !isAuthReady) return

    const passwordRef = ref(db, `lists/${listId}/metadata/password`)

    const unsubscribe = onValue(passwordRef, (snapshot) => {
      const passwordData = snapshot.val()
      const hasPassword = !!passwordData?.hashedPassword

      setIsPasswordProtected(hasPassword)

      // Check if we have unlocked this list in this session
      const sessionUnlocked = sessionStorage.getItem(`unlocked-${listId}`)

      if (hasPassword && !sessionUnlocked) {
        // List is locked, show password prompt
        setIsUnlocked(false)
        setPasswordMode('verify')
        setShowPasswordPrompt(true)
      } else {
        // List is unlocked or has no password
        setIsUnlocked(true)
      }
    })

    return () => {
      off(passwordRef, 'value', unsubscribe)
    }
  }, [listId, isAuthReady])

  // Show password hint once per list
  useEffect(() => {
    const passwordHintKey = `password-hint-shown-${listId}`
    const hasShownHintBefore = localStorage.getItem(passwordHintKey) === 'true'

    // Show hint if: list is not password protected and we haven't shown it before
    if (!isPasswordProtected && !hasShownHintBefore && isAuthReady && isUnlocked) {
      // Delay to let the UI settle and avoid collision with other hints
      setTimeout(() => {
        setToastMessage('🔒 Tipp: Schütze diese Liste mit einem Passwort!')
        setToastType('info')
        setToastVisible(true)
        setHasShownPasswordHint(true)
        localStorage.setItem(passwordHintKey, 'true')

        // Auto-stop pulsing after 8 seconds
        setTimeout(() => {
          setHasShownPasswordHint(false)
        }, 8000)
      }, 10000) // Show after 10 seconds to avoid collision
    }
  }, [listId, isAuthReady, isPasswordProtected, isUnlocked])

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
    
    const showFirebaseError = (reason: string, error?: unknown) => {
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
    const updatePresence = async () => {
      const userPresence = {
        ...baseUserPresence,
        lastSeen: serverTimestamp()
      }
      
      // Debug auth state before write
      console.log('🔍 DEBUG: Before presence write')
      console.log('User ID from useEffect:', user.uid)
      console.log('Current auth.currentUser:', auth?.currentUser?.uid)
      console.log('UserRef path:', userRef.toString())
      console.log('Auth state:', {
        isAnonymous: user.isAnonymous,
        providerData: user.providerData.length
      })
      
      try {
        await set(userRef, userPresence)
        console.log('✅ Presence updated successfully')
      } catch (error: any) {
        console.error('❌ Presence update failed:', error.code, error.message)
        console.error('Error details:', error)
        
        // Additional debug info on failure
        console.log('🔍 DEBUG: On failure')
        console.log('Auth current user at failure:', auth?.currentUser?.uid)
        console.log('User from state at failure:', user.uid)
        console.log('Are they equal?', auth?.currentUser?.uid === user.uid)
        
        // Check if we can read the presence path (should work if auth is valid)
        try {
          const { get } = await import('firebase/database')
          const readResult = await get(userRef)
          console.log('🔍 Can read own presence path:', readResult.exists())
        } catch (readError: any) {
          console.log('🔍 Cannot read own presence path:', readError.code)
        }
      }
    }
    
    // Set initial presence with small delay to ensure auth token is ready
    setTimeout(updatePresence, 100)
    
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

        // Sort by last seen time (most recent first)
        const sortedUsers = sortUsersByLastSeen(allUsers)

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
    }, (error: unknown) => {
      console.error('❌ Error loading todos:', error)
      const errorMessage = error instanceof Error ? error.message : 'database-read-failed'
      setFirebaseStatus(`error: ${errorMessage}`)
    })

    return () => off(todosRef, 'value', unsubscribe)
  }, [isAuthReady, user, listId])


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

    // If uncompleting (unhaking), ask for confirmation
    if (!completed) {
      setPendingToggle({ id, completed })
      setShowConfirmDialog(true)
      return
    }

    // Direct completion without confirmation
    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await update(todoRef, {
      completed,
      completedAt: serverTimestamp(),
      completedBy: user?.uid || 'unknown',
      completedByName: userName || 'Unbekannt'
    })
  }

  const confirmToggleTodo = async () => {
    if (!pendingToggle || !isFirebaseConfigured() || !db) return

    // Check if this is password removal confirmation
    if (pendingToggle.id === 'password-remove') {
      // Remove password protection
      const passwordRef = ref(db, `lists/${listId}/metadata/password`)
      await set(passwordRef, null)
      setIsPasswordProtected(false)
      setIsUnlocked(true)
      sessionStorage.removeItem(`unlocked-${listId}`)

      setToastMessage('🔓 Passwortschutz wurde entfernt')
      setToastType('success')
      setToastVisible(true)

      setShowConfirmDialog(false)
      setPendingToggle(null)
      return
    }

    // Original todo toggle logic
    const todoRef = ref(db, `lists/${listId}/todos/${pendingToggle.id}`)
    await update(todoRef, {
      completed: pendingToggle.completed,
      completedAt: null,
      completedBy: null,
      completedByName: null
    })

    setShowConfirmDialog(false)
    setPendingToggle(null)
  }

  const cancelToggleTodo = () => {
    setShowConfirmDialog(false)
    setPendingToggle(null)
  }
  
  const handleUpdateTodo = async (id: string, text: string) => {
    if (!isFirebaseConfigured() || !db) return

    const todoRef = ref(db, `lists/${listId}/todos/${id}`)
    await update(todoRef, { 
      text,
      updatedAt: serverTimestamp(),
      updatedBy: userName || 'Unknown'
    })
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
      deletedBy: null,
      restoredAt: serverTimestamp(),
      restoredBy: userName || 'Unknown'
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
    setShowSharingModal(true)
  }

  // List name editing functions
  const handleEditListName = () => {
    setIsEditingListName(true)
    setEditingListNameValue(listName)
  }

  const handleSaveListName = async () => {
    if (!isFirebaseConfigured() || !db) return
    
    const newName = editingListNameValue.trim()
    const listNameRef = ref(db!, `lists/${listId}/metadata/name`)
    
    if (newName && newName !== listId) {
      // Save custom name to Firebase
      await set(listNameRef, newName)
    } else {
      // Remove custom name (use listId as default)
      await set(listNameRef, null)
    }
    
    setIsEditingListName(false)
    setEditingListNameValue('')
  }

  const handleCancelEditListName = () => {
    setIsEditingListName(false)
    setEditingListNameValue('')
  }

  const handleListNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveListName()
    } else if (e.key === 'Escape') {
      handleCancelEditListName()
    }
  }

  // Description save handler
  const handleSaveDescription = async (newDescription: string) => {
    if (!user || !db) return

    try {
      const descriptionRef = ref(db, `lists/${listId}/metadata/description`)
      await set(descriptionRef, newDescription || null)

      setToastMessage('Beschreibung gespeichert')
      setToastType('success')
      setToastVisible(true)
    } catch (error) {
      console.error('Error saving description:', error)
      setToastMessage('Fehler beim Speichern der Beschreibung')
      setToastType('warning')
      setToastVisible(true)
    }
  }

  // Pin/Unpin functionality
  const handleTogglePin = () => {
    if (isPinned) {
      removeLocalListId(listId)
      setIsPinned(false)
      // Show notification
      setToastMessage('Liste aus diesem Browser entpinnt')
      setToastType('info')
      setToastVisible(true)
    } else {
      addLocalListId(listId)
      setIsPinned(true)
      setHasShownPinHint(false) // Stop the pin button animation
      // Show notification
      setToastMessage('Liste in diesem Browser gepinnt')
      setToastType('success')
      setToastVisible(true)
    }
  }
  
  // Load guest links (from top-level guestLinks, filtered by listId)
  useEffect(() => {
    console.log('🔗 Guest links useEffect triggered', {
      isAuthReady,
      user: user?.uid,
      listId,
      hasDb: !!db,
      isConfigured: isFirebaseConfigured()
    })

    if (!isAuthReady || !user || !isFirebaseConfigured() || !db) {
      console.log('🔗 Guest links useEffect: early return')
      return
    }

    console.log('🔗 Setting up guest links listener...')
    const guestLinksRef = ref(db, `guestLinks`)

    const unsubscribeGuestLinks = onValue(
      guestLinksRef,
      (snapshot) => {
        const data = snapshot.val()
        console.log('🔗 Guest links raw data:', data)
        if (data) {
          const allLinks = Object.keys(data)
            .map(linkId => ({
              id: linkId,
              ...data[linkId]
            }))
          console.log('🔗 All guest links:', allLinks)
          console.log('🔗 Current listId:', listId)

          const linksList = allLinks.filter((link: any) => link.listId === listId) as GuestLink[]
          console.log('🔗 Filtered guest links for this list:', linksList)
          setGuestLinks(linksList)
        } else {
          console.log('🔗 No guest links found in database')
          setGuestLinks([])
        }
      },
      (error) => {
        console.error('🔗 Error loading guest links:', error)
      }
    )

    return () => {
      off(guestLinksRef, 'value', unsubscribeGuestLinks)
    }
  }, [isAuthReady, user, listId])
  
  // Sharing functions
  const handleCreateGuestLink = async () => {
    if (!user || !isFirebaseConfigured() || !db) return

    try {
      console.log('Creating guest link for list:', listId)
      const guestLinksRef = ref(db, `guestLinks`)
      const newLinkRef = push(guestLinksRef)

      await set(newLinkRef, {
        listId: listId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        revoked: false
      })

      console.log('Guest link created:', newLinkRef.key)
    } catch (error) {
      console.error('Error creating guest link:', error)
    }
  }
  
  const handleRevokeGuestLink = async (linkId: string) => {
    if (!user || !isFirebaseConfigured() || !db) return

    try {
      console.log('Revoking guest link:', linkId)
      const linkRef = ref(db, `guestLinks/${linkId}`)
      await update(linkRef, {
        revoked: true,
        revokedAt: serverTimestamp(),
        revokedBy: user.uid
      })

      console.log('Guest link revoked:', linkId)
    } catch (error) {
      console.error('Error revoking guest link:', error)
    }
  }

  // Password protection functions
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleTogglePasswordProtection = async () => {
    if (isPasswordProtected) {
      // Remove password protection - if already unlocked, just confirm and remove
      if (isUnlocked) {
        // Show confirmation dialog
        setShowConfirmDialog(true)
        setPendingToggle({ id: 'password-remove', completed: false })
      } else {
        // Not unlocked yet, need to verify password first
        setPasswordMode('remove')
        setShowPasswordPrompt(true)
      }
    } else {
      // Lock (set password)
      setPasswordMode('set')
      setShowPasswordPrompt(true)
    }
  }

  const handlePasswordConfirm = async (password: string) => {
    if (!user || !isFirebaseConfigured() || !db) return

    setPasswordError('')

    if (passwordMode === 'set') {
      // Set new password (lock the list)
      try {
        const hashedPassword = await hashPassword(password)
        const passwordRef = ref(db, `lists/${listId}/metadata/password`)
        await set(passwordRef, {
          hashedPassword,
          createdBy: user.uid,
          createdAt: serverTimestamp()
        })

        setIsPasswordProtected(true)
        setIsUnlocked(true)
        setShowPasswordPrompt(false)
        sessionStorage.setItem(`unlocked-${listId}`, 'true')

        setToastMessage('🔒 Liste ist jetzt passwortgeschützt')
        setToastType('success')
        setToastVisible(true)
        setHasShownPasswordHint(false)
      } catch (error) {
        console.error('Error setting password:', error)
        setPasswordError('Fehler beim Setzen des Passworts')
      }
    } else if (passwordMode === 'remove') {
      // Remove password protection - verify first, then remove
      try {
        const hashedPassword = await hashPassword(password)
        const passwordRef = ref(db, `lists/${listId}/metadata/password`)
        const { get } = await import('firebase/database')
        const snapshot = await get(passwordRef)
        const passwordData = snapshot.val()

        if (passwordData?.hashedPassword === hashedPassword) {
          // Password correct - remove password protection
          await set(passwordRef, null)
          setIsPasswordProtected(false)
          setIsUnlocked(true)
          setShowPasswordPrompt(false)
          sessionStorage.removeItem(`unlocked-${listId}`)

          setToastMessage('🔓 Passwortschutz wurde entfernt')
          setToastType('success')
          setToastVisible(true)
        } else {
          // Password incorrect
          setPasswordError('Falsches Passwort')
        }
      } catch (error) {
        console.error('Error removing password:', error)
        setPasswordError('Fehler beim Entfernen des Passworts')
      }
    } else {
      // Verify password (for initial access)
      try {
        const hashedPassword = await hashPassword(password)
        const passwordRef = ref(db, `lists/${listId}/metadata/password`)
        const { get } = await import('firebase/database')
        const snapshot = await get(passwordRef)
        const passwordData = snapshot.val()

        if (passwordData?.hashedPassword === hashedPassword) {
          // Password correct - grant access but keep list locked
          setIsUnlocked(true)
          setShowPasswordPrompt(false)
          sessionStorage.setItem(`unlocked-${listId}`, 'true')

          setToastMessage('✅ Zugang gewährt')
          setToastType('success')
          setToastVisible(true)
        } else {
          // Password incorrect
          setPasswordError('Falsches Passwort')
        }
      } catch (error) {
        console.error('Error verifying password:', error)
        setPasswordError('Fehler beim Überprüfen des Passworts')
      }
    }
  }

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false)
    setPasswordError('')

    // If list is locked and user cancels, redirect to home
    if (isPasswordProtected && !isUnlocked) {
      window.location.href = '/'
    }
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

  // If password protected and not unlocked, show only password prompt (blocking view)
  if (isPasswordProtected && !isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <PasswordPrompt
          isOpen={true}
          mode="verify"
          onConfirm={handlePasswordConfirm}
          onCancel={handlePasswordCancel}
          error={passwordError}
        />
      </div>
    )
  }

  const onlineUserCount = users.filter(u => isUserOnline(u)).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-sans">
      {/* Sticky Header - All Sizes */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        {/* Mobile Layout (<md) */}
        <div className="md:hidden px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col flex-1 min-w-0">
              <Link
                href="/"
                className="flex items-center space-x-2 mb-1"
                title="Zur Startseite"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">
                  mach<span className="text-pink-500">.</span>einfach
                </h1>
              </Link>
              {isEditingListName ? (
                <div className="flex items-center space-x-1 ml-10">
                  <input
                    type="text"
                    value={editingListNameValue}
                    onChange={(e) => setEditingListNameValue(e.target.value)}
                    onKeyDown={handleListNameKeyPress}
                    onBlur={handleCancelEditListName}
                    className="bg-white/80 border border-purple-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent flex-1 min-w-0"
                    placeholder="Listenname..."
                    autoFocus
                  />
                  <button
                    onClick={handleSaveListName}
                    className="w-6 h-6 bg-green-400 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    title="Speichern"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={handleCancelEditListName}
                    className="w-6 h-6 bg-gray-400 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    title="Abbrechen"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1 ml-10 cursor-pointer group min-w-0" onClick={handleEditListName}>
                  <span className="text-sm text-purple-600 font-bold group-hover:text-purple-700 transition-colors truncate">
                    {listName}
                  </span>
                  <Edit2 className="w-3 h-3 text-purple-400 opacity-100 transition-opacity flex-shrink-0" />
                </div>
              )}
            </div>
            <HeaderActionsMenu
              listId={listId}
              isPinned={isPinned}
              isPasswordProtected={isPasswordProtected}
              onTogglePin={handleTogglePin}
              onTogglePasswordProtection={handleTogglePasswordProtection}
              onShare={copyLinkToClipboard}
              userCount={users.length}
              onlineUserCount={onlineUserCount}
            />
          </div>
          <TodoInput onAddTodo={handleAddTodo} />
        </div>

        {/* Desktop Layout (≥md) */}
        <div className="hidden md:block container mx-auto px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center space-x-3 mb-3 sm:mb-0">
              <Link
                href="/"
                className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110 hover:rotate-12"
                title="Zur Startseite"
              >
                <Zap className="w-6 h-6 text-white" />
              </Link>
              <div className="flex flex-col">
                <Link
                  href="/"
                  className="group"
                  title="Zur Startseite"
                >
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-purple-600 transition-colors duration-200">
                    mach<span className="text-pink-500">.</span>einfach
                  </h1>
                </Link>
                <div className="flex items-center space-x-2 mt-1">
                  {isEditingListName ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingListNameValue}
                        onChange={(e) => setEditingListNameValue(e.target.value)}
                        onKeyDown={handleListNameKeyPress}
                        onBlur={handleCancelEditListName}
                        className="bg-white/80 border border-purple-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent min-w-[200px]"
                        placeholder="Listenname eingeben..."
                        autoFocus
                      />
                      <button
                        onClick={handleSaveListName}
                        className="w-6 h-6 bg-green-400 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors duration-200"
                        title="Speichern"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={handleCancelEditListName}
                        className="w-6 h-6 bg-gray-400 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors duration-200"
                        title="Abbrechen"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 group cursor-pointer" onClick={handleEditListName}>
                      <span className="text-base text-purple-600 font-bold group-hover:text-purple-700 transition-colors duration-200">
                        {listName}
                      </span>
                      <Edit2 className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  )}
                  <p className="text-xs text-slate-400 font-mono">
                    {isEditingListName ? '// enter = speichern, esc = abbrechen' : '// zum bearbeiten klicken'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserAvatars
                users={users}
                currentUserId={user?.uid}
                userName={userName}
                onNameChange={setUserName}
                listId={listId}
                hasShownNameHint={hasShownNameHint}
              />
              <button
                onClick={handleTogglePin}
                className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border ${
                  isPinned
                    ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                    : 'bg-white text-slate-400 border-gray-200 hover:bg-gray-50 hover:text-slate-600'
                } ${
                  hasShownPinHint && !isPinned ? 'gentle-pulse-animation' : ''
                }`}
                title={isPinned ? 'Aus diesem Browser entpinnen' : 'In diesem Browser pinnen'}
              >
                {isPinned ? (
                  <Pin className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleTogglePasswordProtection}
                className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border ${
                  isPasswordProtected
                    ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                    : 'bg-white text-slate-400 border-gray-200 hover:bg-gray-50 hover:text-slate-600'
                } ${
                  hasShownPasswordHint && !isPasswordProtected ? 'gentle-pulse-animation' : ''
                }`}
                title={isPasswordProtected ? 'Passwortschutz entfernen' : 'Mit Passwort schützen'}
              >
                {isPasswordProtected ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={copyLinkToClipboard}
                className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border bg-white text-blue-500 border-gray-200 hover:bg-blue-50"
                title="Liste teilen"
              >
                <LinkIcon className="w-4 h-4" />
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

        {/* Add Todo Form - Desktop only (mobile has it in sticky header) */}
        <div className="hidden md:block">
          <TodoInput onAddTodo={handleAddTodo} />
        </div>

        {/* List Description - between input and items */}
        <div className="mb-6">
          <ListDescription
            description={listDescription}
            onSave={handleSaveDescription}
          />
        </div>

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

      {/* Sharing Modal */}
      <SharingModal
        isOpen={showSharingModal}
        onClose={() => setShowSharingModal(false)}
        listId={listId}
        listName={listName}
        guestLinks={guestLinks}
        onCreateGuestLink={handleCreateGuestLink}
        onRevokeGuestLink={handleRevokeGuestLink}
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={pendingToggle?.id === 'password-remove' ? 'Passwortschutz entfernen?' : 'Abhaken rückgängig machen?'}
        message={pendingToggle?.id === 'password-remove'
          ? 'Möchtest du den Passwortschutz wirklich entfernen? Danach kann jeder auf die Liste zugreifen.'
          : 'Möchtest du diese Aufgabe wirklich wieder als offen markieren?'}
        confirmText={pendingToggle?.id === 'password-remove' ? 'Ja, Schutz entfernen' : 'Ja, rückgängig machen'}
        cancelText="Abbrechen"
        onConfirm={confirmToggleTodo}
        onCancel={cancelToggleTodo}
        variant="warning"
      />

      {/* Password Prompt (for setting/removing password when already unlocked) */}
      {isUnlocked && (
        <PasswordPrompt
          isOpen={showPasswordPrompt}
          mode={passwordMode}
          onConfirm={handlePasswordConfirm}
          onCancel={handlePasswordCancel}
          error={passwordError}
        />
      )}
    </div>
  )
}