import { auth, db, isFirebaseConfigured } from './firebase'
import { signInAnonymously } from 'firebase/auth'
import { ref, set, get, onValue, off } from 'firebase/database'

export async function testFirebaseConnection() {
  const results = {
    configured: false,
    authAvailable: false,
    databaseAvailable: false,
    authSuccess: false,
    databaseWrite: false,
    databaseRead: false,
    error: null as string | null
  }

  try {
    // Check configuration
    results.configured = isFirebaseConfigured()
    results.authAvailable = !!auth
    results.databaseAvailable = !!db

    if (!results.configured || !auth || !db) {
      results.error = 'Firebase not properly configured'
      return results
    }

    // Test authentication
    try {
      const userCredential = await signInAnonymously(auth)
      results.authSuccess = !!userCredential.user
    } catch (authError: any) {
      results.error = `Auth failed: ${authError.code}`
      return results
    }

    // Test database write
    try {
      const testRef = ref(db, 'test/connection')
      await set(testRef, {
        timestamp: Date.now(),
        test: 'Firebase connection test'
      })
      results.databaseWrite = true
    } catch (writeError: any) {
      results.error = `Database write failed: ${writeError.code}`
      return results
    }

    // Test database read
    try {
      const testRef = ref(db, 'test/connection')
      const snapshot = await get(testRef)
      results.databaseRead = snapshot.exists()
    } catch (readError: any) {
      results.error = `Database read failed: ${readError.code}`
    }

  } catch (error: any) {
    results.error = `General error: ${error.message}`
  }

  return results
}

export function createTestTodoList(listId: string) {
  if (!isFirebaseConfigured() || !db) {
    console.log('🔧 Firebase not configured - cannot create test list')
    return
  }

  const database = db // TypeScript assertion that db is not null

  const testTodos = [
    {
      text: 'Firebase Realtime Database testen',
      completed: false,
      createdAt: Date.now(),
      createdBy: 'test-user',
      creatorName: 'Test User'
    },
    {
      text: 'Real-time Synchronisation verifizieren',
      completed: false,
      createdAt: Date.now() + 1,
      createdBy: 'test-user',
      creatorName: 'Test User'
    },
    {
      text: 'Multi-user Kollaboration testen',
      completed: true,
      createdAt: Date.now() + 2,
      createdBy: 'test-user',
      creatorName: 'Test User'
    }
  ]

  // const listRef = ref(database, `lists/${listId}/todos`) // Not needed for individual todo creation
  
  testTodos.forEach((todo, index) => {
    const todoRef = ref(database, `lists/${listId}/todos/test-todo-${index}`)
    set(todoRef, todo)
  })

  console.log(`✅ Test todos created for list: ${listId}`)
}

// Export für Browser-Console debugging
if (typeof window !== 'undefined') {
  ;(window as any).firebaseTest = {
    testConnection: testFirebaseConnection,
    createTestList: createTestTodoList,
    firebase: { auth, db, isConfigured: isFirebaseConfigured }
  }
}