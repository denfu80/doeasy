/**
 * Firebase Database Rules Testing (ES Module)
 * Tests für deine database.rules.json lokal ausführen
 */

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, push, connectDatabaseEmulator } from 'firebase/database'
import { getAuth, signInAnonymously, signOut, connectAuthEmulator } from 'firebase/auth'

// Emulator-Konfiguration
const testConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  databaseURL: "https://demo-project-default-rtdb.firebaseio.com/",
  projectId: "demo-project"
}

// Test Suite für Database Rules
class DatabaseRulesTest {

  constructor() {
    this.app = null
    this.db = null
    this.auth = null
  }

  async setup() {
    console.log('🔧 Setting up emulator connection...')

    // Initialize Firebase app for testing
    this.app = initializeApp(testConfig, 'test-app-' + Math.random())
    this.auth = getAuth(this.app)
    this.db = getDatabase(this.app)

    // Connect to emulators
    try {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true })
      connectDatabaseEmulator(this.db, '127.0.0.1', 9000)
      console.log('✅ Connected to Firebase Emulators')
    } catch (error) {
      // Emulators might already be connected, ignore errors
      console.log('⚠️ Emulator connection:', error.message)
    }
  }

  async cleanup() {
    try {
      if (this.auth?.currentUser) {
        await signOut(this.auth)
      }
    } catch (e) {
      // Ignore signout errors
    }
  }

  // Test: Unauthenticated users cannot access lists
  async testUnauthenticatedAccess() {
    console.log('\n📝 Test: Unauthenticated access should be denied')

    await this.cleanup() // Ensure not signed in

    try {
      const testListRef = ref(this.db, 'lists/test-list-id/todos')
      await get(testListRef)
      console.log('❌ FAIL: Unauthenticated read should be denied')
      return false
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        console.log('✅ PASS: Unauthenticated access properly denied')
        return true
      }
      console.log('❌ UNEXPECTED ERROR:', error.message, error.code)
      return false
    }
  }

  // Test: Authenticated users can read/write todos
  async testAuthenticatedTodoAccess() {
    console.log('\n📝 Test: Authenticated users can access todos')

    try {
      // Sign in anonymously
      const userCredential = await signInAnonymously(this.auth)
      const userId = userCredential.user.uid
      console.log('🔑 Signed in as:', userId)

      // Test writing a todo
      const listId = 'test-list-authenticated'
      const todosRef = ref(this.db, `lists/${listId}/todos`)
      const newTodoRef = push(todosRef)

      const todoData = {
        text: "Test todo item",
        completed: false,
        createdAt: Date.now(),
        createdBy: userId,
        creatorName: "Test User"
      }

      await set(newTodoRef, todoData)
      console.log('✅ Todo written successfully')

      // Test reading back
      const snapshot = await get(newTodoRef)
      const readData = snapshot.val()

      if (readData && readData.text === todoData.text) {
        console.log('✅ PASS: Authenticated read/write works')
        return true
      } else {
        console.log('❌ FAIL: Data mismatch after read')
        return false
      }

    } catch (error) {
      console.log('❌ FAIL: Authenticated access error:', error.message, error.code)
      return false
    }
  }

  // Test: Todo validation (text required, max length)
  async testTodoValidation() {
    console.log('\n📝 Test: Todo validation rules')

    try {
      const userCredential = await signInAnonymously(this.auth)
      const userId = userCredential.user.uid

      const listId = 'test-list-validation'
      const todosRef = ref(this.db, `lists/${listId}/todos`)

      // Test 1: Empty text should fail
      try {
        const emptyTodoRef = push(todosRef)
        await set(emptyTodoRef, {
          text: "", // Empty text should be invalid
          completed: false,
          createdAt: Date.now(),
          createdBy: userId,
          creatorName: "Test User"
        })
        console.log('❌ FAIL: Empty text should be rejected')
        return false
      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          console.log('✅ PASS: Empty text properly rejected')
        } else {
          console.log('❌ UNEXPECTED ERROR for empty text:', error.message)
          return false
        }
      }

      // Test 2: Too long text should fail (>500 chars)
      try {
        const longTodoRef = push(todosRef)
        const longText = 'x'.repeat(501) // 501 characters
        await set(longTodoRef, {
          text: longText,
          completed: false,
          createdAt: Date.now(),
          createdBy: userId,
          creatorName: "Test User"
        })
        console.log('❌ FAIL: Long text should be rejected')
        return false
      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          console.log('✅ PASS: Long text properly rejected')
          return true
        } else {
          console.log('❌ UNEXPECTED ERROR for long text:', error.message)
          return false
        }
      }

    } catch (error) {
      console.log('❌ FAIL: Validation test error:', error.message)
      return false
    }
  }

  // Test: User can only write their own presence
  async testPresenceAccess() {
    console.log('\n📝 Test: Presence access control')

    try {
      const userCredential = await signInAnonymously(this.auth)
      const userId = userCredential.user.uid
      const fakeUserId = 'fake-user-id-12345'

      const listId = 'test-list-presence'

      // Test 1: Writing own presence should work
      const ownPresenceRef = ref(this.db, `lists/${listId}/presence/${userId}`)
      await set(ownPresenceRef, {
        name: "Test User",
        color: "#ff0000",
        onlineAt: Date.now()
      })
      console.log('✅ PASS: Own presence write allowed')

      // Test 2: Writing other user's presence should fail
      try {
        const otherPresenceRef = ref(this.db, `lists/${listId}/presence/${fakeUserId}`)
        await set(otherPresenceRef, {
          name: "Fake User",
          color: "#00ff00",
          onlineAt: Date.now()
        })
        console.log('❌ FAIL: Should not be able to write other user presence')
        return false
      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          console.log('✅ PASS: Other user presence write properly denied')
          return true
        } else {
          console.log('❌ UNEXPECTED ERROR:', error.message)
          return false
        }
      }

    } catch (error) {
      console.log('❌ FAIL: Presence test error:', error.message)
      return false
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Firebase Database Rules Tests...\n')
    console.log('⚠️  Make sure Firebase Emulator is running: npm run firebase:emulators\n')

    await this.setup()

    const tests = [
      () => this.testUnauthenticatedAccess(),
      () => this.testAuthenticatedTodoAccess(),
      () => this.testTodoValidation(),
      () => this.testPresenceAccess()
    ]

    let passed = 0
    let total = tests.length

    for (const test of tests) {
      try {
        const result = await test()
        if (result === true) {
          passed++
        }
      } catch (error) {
        console.log('❌ Test failed with error:', error.message)
      }
    }

    console.log(`\n🏁 Test Results: ${passed}/${total} passed`)

    if (passed === total) {
      console.log('🎉 All tests passed!')
      process.exit(0)
    } else {
      console.log('💥 Some tests failed!')
      process.exit(1)
    }

    await this.cleanup()
  }
}

// Run tests if this file is executed directly
const tester = new DatabaseRulesTest()
tester.runAllTests().catch(console.error)