/**
 * Firebase Database Rules Test - Minimal Setup
 * Startpunkt für schrittweise Test-Entwicklung
 */

const { initializeApp } = require('firebase/app')
const { getDatabase, ref, set, get, connectDatabaseEmulator } = require('firebase/database')
const { getAuth, signInAnonymously, connectAuthEmulator } = require('firebase/auth')

class RulesTest {
  constructor() {
    this.app = null
    this.auth = null
    this.database = null
  }

  async setup() {
    console.log('🔥 Firebase Rules Test')
    console.log('======================')

    const firebaseConfig = {
      apiKey: "demo-key",
      authDomain: "demo-test.firebaseapp.com",
      databaseURL: "https://demo-test-default-rtdb.firebaseio.com/",
      projectId: "demo-test"
    }

    try {
      this.app = initializeApp(firebaseConfig, 'rules-test')
      this.auth = getAuth(this.app)
      this.database = getDatabase(this.app)

      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true })
      connectDatabaseEmulator(this.database, '127.0.0.1', 9000)

      console.log('✅ Connected to Firebase Emulator')
    } catch (error) {
      console.log('❌ Setup failed:', error.message)
      throw error
    }
  }

  // Basis-Test: Authentication erforderlich
  async testBasicAuth() {
    console.log('\n📝 Test: Authentication required')

    // Ohne Auth - sollte fehlschlagen
    try {
      const testRef = ref(this.database, 'lists/test/todos')
      await get(testRef)
      console.log('❌ FAIL: Unauthenticated access should be blocked')
      return false
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        console.log('✅ PASS: Unauthenticated access blocked')
      } else {
        console.log('❌ UNEXPECTED:', error.code)
        return false
      }
    }

    // Mit Auth - sollte funktionieren
    try {
      await signInAnonymously(this.auth)
      const userId = this.auth.currentUser.uid
      console.log(`🔑 Signed in: ${userId.substring(0, 8)}...`)

      const testRef = ref(this.database, 'lists/test/todos/test-todo')
      await set(testRef, {
        text: "Test todo",
        completed: false,
        createdAt: Date.now(),
        createdBy: userId,
        creatorName: "Test User"
      })

      console.log('✅ PASS: Authenticated write successful')
      return true
    } catch (error) {
      console.log('❌ FAIL: Authenticated access failed:', error.code)
      return false
    }
  }

  async runTests() {
    await this.setup()

    const results = []

    // Nur der eine Basis-Test
    results.push(await this.testBasicAuth())

    const passed = results.filter(r => r === true).length
    const total = results.length

    console.log('\n======================')
    console.log(`🏁 Results: ${passed}/${total} passed`)

    if (passed === total) {
      console.log('🎉 All tests passed!')
    } else {
      console.log('💥 Some tests failed')
    }
  }
}

// Test ausführen
if (require.main === module) {
  const test = new RulesTest()
  test.runTests().catch(console.error)
}

module.exports = RulesTest