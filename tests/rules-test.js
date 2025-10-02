/**
 * Firebase Database Rules Testing
 * Tests für deine database.rules.json lokal ausführen
 */

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, push } from 'firebase/database'
import { getAuth, signInAnonymously, signOut } from 'firebase/auth'

// Emulator-Konfiguration
const testConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  databaseURL: "http://127.0.0.1:9000/?ns=demo-project",
  projectId: "demo-project"
}

const app = initializeApp(testConfig, 'test-app')
const db = getDatabase(app)
const auth = getAuth(app)

// Test Suite für Database Rules
class DatabaseRulesTest {

  async setup() {
    console.log('🔧 Setting up emulator connection...')
    // Ensure we're using emulator
    if (typeof window !== 'undefined') {
      // Browser environment
      db.useEmulator('127.0.0.1', 9000)
      auth.useEmulator('http://127.0.0.1:9099')
    }
  }

  async cleanup() {
    try {
      await signOut(auth)
    } catch (e) {
      // Ignore signout errors
    }
  }

  // Test: Unauthenticated users cannot access lists
  async testUnauthenticatedAccess() {
    console.log('\n📝 Test: Unauthenticated access should be denied')

    await this.cleanup() // Ensure not signed in

    try {
      const testListRef = ref(db, 'lists/test-list-id/todos')
      await get(testListRef)
      console.log('❌ FAIL: Unauthenticated read should be denied')
      return false
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        console.log('✅ PASS: Unauthenticated access properly denied')
        return true
      }
      console.log('❌ UNEXPECTED ERROR:', error.message)
      return false
    }
  }

  // Test: Authenticated users can read/write todos
  async testAuthenticatedTodoAccess() {
    console.log('\n📝 Test: Authenticated users can access todos')

    try {
      // Sign in anonymously
      const userCredential = await signInAnonymously(auth)
      const userId = userCredential.user.uid

      // Test writing a todo
      const listId = 'test-list-authenticated'
      const todosRef = ref(db, `lists/${listId}/todos`)
      const newTodoRef = push(todosRef)

      const todoData = {
        text: "Test todo item",
        completed: false,
        createdAt: Date.now(),
        createdBy: userId,
        creatorName: "Test User"
      }

      await set(newTodoRef, todoData)

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
      console.log('❌ FAIL: Authenticated access error:', error.message)
      return false
    }
  }

  // Test: Todo validation (text required, max length)
  async testTodoValidation() {
    console.log('\n📝 Test: Todo validation rules')

    try {
      await signInAnonymously(auth)
      const userId = auth.currentUser.uid

      const listId = 'test-list-validation'
      const todosRef = ref(db, `lists/${listId}/todos`)

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
      await signInAnonymously(auth)
      const userId = auth.currentUser.uid
      const fakeUserId = 'fake-user-id-12345'

      const listId = 'test-list-presence'

      // Test 1: Writing own presence should work
      const ownPresenceRef = ref(db, `lists/${listId}/presence/${userId}`)
      await set(ownPresenceRef, {
        name: "Test User",
        color: "#ff0000",
        onlineAt: Date.now()
      })
      console.log('✅ PASS: Own presence write allowed')

      // Test 2: Writing other user's presence should fail
      try {
        const otherPresenceRef = ref(db, `lists/${listId}/presence/${fakeUserId}`)
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
      this.testUnauthenticatedAccess(),
      this.testAuthenticatedTodoAccess(),
      this.testTodoValidation(),
      this.testPresenceAccess()
    ]

    const results = await Promise.all(tests)
    const passed = results.filter(r => r === true).length
    const total = results.length

    console.log(`\n🏁 Test Results: ${passed}/${total} passed`)

    if (passed === total) {
      console.log('🎉 All tests passed!')
    } else {
      console.log('💥 Some tests failed!')
      process.exit(1)
    }

    await this.cleanup()
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new DatabaseRulesTest()
  tester.runAllTests().catch(console.error)
}

export default DatabaseRulesTest