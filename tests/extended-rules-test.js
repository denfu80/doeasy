/**
 * Erweiterte Firebase Rules Tests
 * Basiert auf dem funktionierenden simple-rules-test.js
 */

const { initializeApp } = require('firebase/app')
const { getDatabase, ref, set, get, push, connectDatabaseEmulator } = require('firebase/database')
const { getAuth, signInAnonymously, connectAuthEmulator } = require('firebase/auth')

class ExtendedRulesTest {
  constructor() {
    this.app = null
    this.auth = null
    this.database = null
    this.testResults = []
  }

  async setup() {
    console.log('🔥 Extended Firebase Rules Tests')
    console.log('==========================================')

    const firebaseConfig = {
      apiKey: "demo-key",
      authDomain: "demo-test.firebaseapp.com",
      databaseURL: "https://demo-test-default-rtdb.firebaseio.com/",
      projectId: "demo-test"
    }

    try {
      this.app = initializeApp(firebaseConfig, 'extended-test')
      this.auth = getAuth(this.app)
      this.database = getDatabase(this.app)

      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true })
      connectDatabaseEmulator(this.database, '127.0.0.1', 9000)

      console.log('✅ Firebase Emulator verbunden\n')
    } catch (error) {
      console.log('❌ Setup Fehler:', error.message)
      throw error
    }
  }

  logTest(name, success, message) {
    const status = success ? '✅' : '❌'
    console.log(`${status} ${name}: ${message}`)
    this.testResults.push({ name, success, message })
  }

  // Test 1: Unauthenticated Access
  async testUnauthenticatedAccess() {
    console.log('📝 Test 1: Unauthenticated Access Control')

    try {
      const testRef = ref(this.database, 'lists/test/todos')
      await get(testRef)
      this.logTest('Unauthenticated Access', false, 'Should have been blocked')
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        this.logTest('Unauthenticated Access', true, 'Properly blocked')
      } else {
        this.logTest('Unauthenticated Access', false, `Unexpected error: ${error.code}`)
      }
    }
  }

  // Test 2: Basic Authenticated CRUD
  async testBasicCRUD() {
    console.log('\n📝 Test 2: Basic CRUD Operations')

    try {
      const userCredential = await signInAnonymously(this.auth)
      const userId = userCredential.user.uid
      console.log(`🔑 Signed in as: ${userId.substring(0, 8)}...`)

      const listId = 'test-crud-list'
      const todosRef = ref(this.database, `lists/${listId}/todos`)
      const newTodoRef = push(todosRef)

      // CREATE
      const todoData = {
        text: "Test CRUD Todo",
        completed: false,
        createdAt: Date.now(),
        createdBy: userId,
        creatorName: "Test User"
      }

      await set(newTodoRef, todoData)
      this.logTest('CREATE Todo', true, 'Todo created successfully')

      // READ
      const snapshot = await get(newTodoRef)
      const readData = snapshot.val()

      if (readData && readData.text === todoData.text) {
        this.logTest('READ Todo', true, 'Todo read successfully')
      } else {
        this.logTest('READ Todo', false, 'Data mismatch')
      }

      // UPDATE
      await set(newTodoRef, { ...todoData, completed: true, updatedAt: Date.now() })
      const updatedSnapshot = await get(newTodoRef)
      const updatedData = updatedSnapshot.val()

      if (updatedData && updatedData.completed === true) {
        this.logTest('UPDATE Todo', true, 'Todo updated successfully')
      } else {
        this.logTest('UPDATE Todo', false, 'Update failed')
      }

    } catch (error) {
      this.logTest('Basic CRUD', false, `Error: ${error.code} - ${error.message}`)
    }
  }

  // Test 3: Data Validation
  async testDataValidation() {
    console.log('\n📝 Test 3: Data Validation Rules')

    try {
      const userCredential = await signInAnonymously(this.auth)
      const userId = userCredential.user.uid

      const listId = 'test-validation-list'
      const todosRef = ref(this.database, `lists/${listId}/todos`)

      // Test 3a: Empty text should fail
      try {
        const emptyTodoRef = push(todosRef)
        await set(emptyTodoRef, {
          text: "", // Invalid: empty text
          completed: false,
          createdAt: Date.now(),
          createdBy: userId,
          creatorName: "Test User"
        })
        this.logTest('Empty Text Validation', false, 'Should have been rejected')
      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          this.logTest('Empty Text Validation', true, 'Empty text properly rejected')
        } else {
          this.logTest('Empty Text Validation', false, `Unexpected error: ${error.code}`)
        }
      }

      // Test 3b: Text too long should fail
      try {
        const longTodoRef = push(todosRef)
        const longText = 'x'.repeat(501) // > 500 characters
        await set(longTodoRef, {
          text: longText,
          completed: false,
          createdAt: Date.now(),
          createdBy: userId,
          creatorName: "Test User"
        })
        this.logTest('Long Text Validation', false, 'Should have been rejected')
      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          this.logTest('Long Text Validation', true, 'Long text properly rejected')
        } else {
          this.logTest('Long Text Validation', false, `Unexpected error: ${error.code}`)
        }
      }

      // Test 3c: Missing required fields
      try {
        const invalidTodoRef = push(todosRef)
        await set(invalidTodoRef, {
          text: "Valid text",
          // Missing required fields: completed, createdAt, createdBy, creatorName
        })
        this.logTest('Required Fields Validation', false, 'Should have been rejected')
      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          this.logTest('Required Fields Validation', true, 'Missing fields properly rejected')
        } else {
          this.logTest('Required Fields Validation', false, `Unexpected error: ${error.code}`)
        }
      }

    } catch (error) {
      this.logTest('Data Validation', false, `Setup error: ${error.message}`)
    }
  }

  // Test 4: Presence System
  async testPresenceSystem() {
    console.log('\n📝 Test 4: User Presence System')

    try {
      const userCredential = await signInAnonymously(this.auth)
      const userId = userCredential.user.uid
      const fakeUserId = 'fake-user-123'

      const listId = 'test-presence-list'

      // Test 4a: Can write own presence
      const ownPresenceRef = ref(this.database, `lists/${listId}/presence/${userId}`)
      await set(ownPresenceRef, {
        name: "Test User",
        color: "#ff0000",
        onlineAt: Date.now()
      })
      this.logTest('Own Presence Write', true, 'Can write own presence')

      // Test 4b: Cannot write other user's presence
      try {
        const otherPresenceRef = ref(this.database, `lists/${listId}/presence/${fakeUserId}`)
        await set(otherPresenceRef, {
          name: "Fake User",
          color: "#00ff00",
          onlineAt: Date.now()
        })
        this.logTest('Other Presence Write', false, 'Should have been blocked')
      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          this.logTest('Other Presence Write', true, 'Other user presence properly blocked')
        } else {
          this.logTest('Other Presence Write', false, `Unexpected error: ${error.code}`)
        }
      }

      // Test 4c: Invalid color format
      try {
        await set(ownPresenceRef, {
          name: "Test User",
          color: "red", // Invalid: not hex format
          onlineAt: Date.now()
        })
        this.logTest('Color Format Validation', false, 'Should have been rejected')
      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          this.logTest('Color Format Validation', true, 'Invalid color format rejected')
        } else {
          this.logTest('Color Format Validation', false, `Unexpected error: ${error.code}`)
        }
      }

    } catch (error) {
      this.logTest('Presence System', false, `Error: ${error.message}`)
    }
  }

  // Test 5: List ID Format Validation
  async testListIdValidation() {
    console.log('\n📝 Test 5: List ID Format Validation')

    try {
      await signInAnonymously(this.auth)
      const userId = this.auth.currentUser.uid

      // Test 5a: Valid list ID (should work)
      const validListId = 'valid-list-123'
      const validRef = ref(this.database, `lists/${validListId}/todos/test`)
      await set(validRef, {
        text: "Test todo",
        completed: false,
        createdAt: Date.now(),
        createdBy: userId,
        creatorName: "Test User"
      })
      this.logTest('Valid List ID', true, 'Valid format accepted')

      // Test 5b: Too short list ID (should fail)
      try {
        const shortListId = 'ab' // < 3 characters
        const shortRef = ref(this.database, `lists/${shortListId}/todos/test`)
        await set(shortRef, {
          text: "Test todo",
          completed: false,
          createdAt: Date.now(),
          createdBy: userId,
          creatorName: "Test User"
        })
        this.logTest('Short List ID', false, 'Should have been rejected')
      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          this.logTest('Short List ID', true, 'Short ID properly rejected')
        }
      }

    } catch (error) {
      this.logTest('List ID Validation', false, `Error: ${error.message}`)
    }
  }

  // Alle Tests ausführen
  async runAllTests() {
    await this.setup()

    const tests = [
      () => this.testUnauthenticatedAccess(),
      () => this.testBasicCRUD(),
      () => this.testDataValidation(),
      () => this.testPresenceSystem(),
      () => this.testListIdValidation()
    ]

    for (const test of tests) {
      try {
        await test()
      } catch (error) {
        console.log('❌ Test crashed:', error.message)
      }
    }

    // Ergebnisse zusammenfassen
    const passed = this.testResults.filter(t => t.success).length
    const total = this.testResults.length

    console.log('\n==========================================')
    console.log(`🏁 Test Results: ${passed}/${total} passed`)

    if (passed === total) {
      console.log('🎉 All tests passed! Your Firebase rules are working correctly.')
    } else {
      console.log('💥 Some tests failed. Check the results above.')

      // Zeige fehlgeschlagene Tests
      const failed = this.testResults.filter(t => !t.success)
      if (failed.length > 0) {
        console.log('\n❌ Failed tests:')
        failed.forEach(test => {
          console.log(`   - ${test.name}: ${test.message}`)
        })
      }
    }

    process.exit(passed === total ? 0 : 1)
  }
}

// Tests starten
if (require.main === module) {
  const tester = new ExtendedRulesTest()
  tester.runAllTests().catch(console.error)
}

module.exports = ExtendedRulesTest