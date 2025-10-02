/**
 * Einfache Firebase Database Rules Testing
 * Funktioniert mit CommonJS und Firebase Emulator
 */

const { initializeApp } = require('firebase/app')
const { getDatabase, ref, set, get, push, connectDatabaseEmulator } = require('firebase/database')
const { getAuth, signInAnonymously, signOut, connectAuthEmulator } = require('firebase/auth')

// Test-Konfiguration für Emulator
const testConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  databaseURL: "https://demo-project-default-rtdb.firebaseio.com/",
  projectId: "demo-project"
}

class DatabaseRulesTest {

  constructor() {
    this.app = null
    this.db = null
    this.auth = null
    this.isSetup = false
  }

  async setup() {
    if (this.isSetup) return

    console.log('🔧 Setting up Firebase for testing...')

    try {
      // Initialize app with unique name
      this.app = initializeApp(testConfig, 'test-' + Date.now())
      this.auth = getAuth(this.app)
      this.db = getDatabase(this.app)

      // Connect to local emulators
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true })
      connectDatabaseEmulator(this.db, '127.0.0.1', 9000)

      this.isSetup = true
      console.log('✅ Firebase test setup complete')

    } catch (error) {
      console.log('⚠️ Setup error (might be normal):', error.code || error.message)
      // Continue anyway - emulators might already be connected
    }
  }

  async cleanup() {
    try {
      if (this.auth?.currentUser) {
        await signOut(this.auth)
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }

  // Test 1: Unauthenticated access sollte verweigert werden
  async testUnauthenticatedAccess() {
    console.log('\n📝 Test 1: Unauthenticated access should be denied')

    await this.cleanup() // Sicherstellen, dass niemand eingeloggt ist

    try {
      const testRef = ref(this.db, 'lists/test-list/todos')
      const snapshot = await get(testRef)

      console.log('❌ FAIL: Unauthenticated read should have been blocked')
      return false

    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        console.log('✅ PASS: Unauthenticated access properly denied')
        return true
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.code, error.message)
        return false
      }
    }
  }

  // Test 2: Authentifizierte Benutzer können todos lesen/schreiben
  async testAuthenticatedAccess() {
    console.log('\n📝 Test 2: Authenticated users can access todos')

    try {
      // Anonymous anmelden
      const userCred = await signInAnonymously(this.auth)
      const userId = userCred.user.uid
      console.log('🔑 Signed in as:', userId.substring(0, 8) + '...')

      // Todo schreiben
      const listId = 'test-list-auth'
      const todosRef = ref(this.db, `lists/${listId}/todos`)
      const newTodoRef = push(todosRef)

      const todoData = {
        text: "Test todo from automated test",
        completed: false,
        createdAt: Date.now(),
        createdBy: userId,
        creatorName: "Test User"
      }

      await set(newTodoRef, todoData)
      console.log('✏️ Todo written successfully')

      // Todo wieder lesen
      const snapshot = await get(newTodoRef)
      const readData = snapshot.val()

      if (readData && readData.text === todoData.text) {
        console.log('✅ PASS: Authenticated read/write works')
        return true
      } else {
        console.log('❌ FAIL: Could not read back written data')
        return false
      }

    } catch (error) {
      console.log('❌ FAIL: Authenticated test error:', error.code, error.message)
      return false
    }
  }

  // Test 3: Validierung von Todo-Feldern
  async testDataValidation() {
    console.log('\n📝 Test 3: Data validation rules')

    try {
      // Einloggen
      const userCred = await signInAnonymously(this.auth)
      const userId = userCred.user.uid

      const listId = 'test-list-validation'
      const todosRef = ref(this.db, `lists/${listId}/todos`)

      // Test: Leerer Text sollte abgelehnt werden
      try {
        const invalidTodoRef = push(todosRef)
        await set(invalidTodoRef, {
          text: "", // Leerer Text -> ungültig
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
          console.log('❌ UNEXPECTED ERROR on empty text:', error.code)
          return false
        }
      }

      // Test: Zu langer Text sollte abgelehnt werden
      try {
        const longTextTodoRef = push(todosRef)
        const veryLongText = 'x'.repeat(501) // Über 500 Zeichen

        await set(longTextTodoRef, {
          text: veryLongText,
          completed: false,
          createdAt: Date.now(),
          createdBy: userId,
          creatorName: "Test User"
        })

        console.log('❌ FAIL: Text over 500 chars should be rejected')
        return false

      } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
          console.log('✅ PASS: Long text properly rejected')
          return true
        } else {
          console.log('❌ UNEXPECTED ERROR on long text:', error.code)
          return false
        }
      }

    } catch (error) {
      console.log('❌ FAIL: Validation test error:', error.code, error.message)
      return false
    }
  }

  // Alle Tests ausführen
  async runAllTests() {
    console.log('🧪 Firebase Database Rules Tests')
    console.log('=====================================')
    console.log('⚠️  Emulator muss laufen: npm run firebase:emulators\n')

    await this.setup()

    const tests = [
      { name: 'Unauthenticated Access', fn: () => this.testUnauthenticatedAccess() },
      { name: 'Authenticated Access', fn: () => this.testAuthenticatedAccess() },
      { name: 'Data Validation', fn: () => this.testDataValidation() }
    ]

    let passed = 0
    const total = tests.length

    for (const test of tests) {
      try {
        const result = await test.fn()
        if (result === true) {
          passed++
        }
      } catch (error) {
        console.log(`❌ Test "${test.name}" crashed:`, error.message)
      }
    }

    console.log('\n=====================================')
    console.log(`🏁 Results: ${passed}/${total} tests passed`)

    if (passed === total) {
      console.log('🎉 All tests passed! Your Firebase rules work correctly.')
    } else {
      console.log('💥 Some tests failed. Check your rules and emulator setup.')
    }

    await this.cleanup()

    // Exit code für CI/CD
    process.exit(passed === total ? 0 : 1)
  }
}

// Tests ausführen wenn direkt gestartet
if (require.main === module) {
  const tester = new DatabaseRulesTest()
  tester.runAllTests().catch(error => {
    console.log('💥 Test runner crashed:', error.message)
    process.exit(1)
  })
}

module.exports = DatabaseRulesTest