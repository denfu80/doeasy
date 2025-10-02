/**
 * Minimaliste Firebase Rules Test
 * Funktioniert mit dem Emulator
 */

const { initializeApp } = require('firebase/app')
const { getDatabase, ref, set, get, connectDatabaseEmulator } = require('firebase/database')
const { getAuth, signInAnonymously, connectAuthEmulator } = require('firebase/auth')

async function testFirebaseRules() {
  console.log('🔥 Firebase Rules Test - Minimal Version')
  console.log('==========================================')

  // Firebase-Konfiguration für Emulator
  const firebaseConfig = {
    apiKey: "demo-key",
    authDomain: "demo-test.firebaseapp.com",
    databaseURL: "https://demo-test-default-rtdb.firebaseio.com/",
    projectId: "demo-test"
  }

  let app, auth, database

  try {
    // Firebase initialisieren
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    database = getDatabase(app)

    // Mit Emulatoren verbinden
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectDatabaseEmulator(database, '127.0.0.1', 9000)

    console.log('✅ Firebase Emulator verbunden')

  } catch (error) {
    console.log('❌ Setup Fehler:', error.message)
    return
  }

  // Test 1: Ohne Login - sollte fehlschlagen
  console.log('\n📝 Test 1: Zugriff ohne Login')
  try {
    const testRef = ref(database, 'lists/test/todos')
    await get(testRef)
    console.log('❌ FEHLER: Unerlaubter Zugriff funktionierte')
  } catch (error) {
    console.log('✅ KORREKT: Zugriff ohne Login blockiert (' + error.code + ')')
  }

  // Test 2: Mit Login - sollte funktionieren
  console.log('\n📝 Test 2: Zugriff mit Login')
  try {
    // Anonymous anmelden
    const userCredential = await signInAnonymously(auth)
    const userId = userCredential.user.uid
    console.log('🔑 Eingeloggt als: ' + userId.substring(0, 8) + '...')

    // Daten schreiben
    const testRef = ref(database, 'lists/test-list/todos/test-todo')
    const testData = {
      text: "Test Todo",
      completed: false,
      createdAt: Date.now(),
      createdBy: userId,
      creatorName: "Test User"
    }

    await set(testRef, testData)
    console.log('✅ Daten erfolgreich geschrieben')

    // Daten lesen
    const snapshot = await get(testRef)
    const data = snapshot.val()

    if (data && data.text === "Test Todo") {
      console.log('✅ Daten erfolgreich gelesen')
    } else {
      console.log('❌ Daten konnten nicht gelesen werden')
    }

  } catch (error) {
    console.log('❌ Test mit Login fehlgeschlagen:', error.code, error.message)
  }

  console.log('\n🏁 Test abgeschlossen!')
}

// Test starten
testFirebaseRules().catch(console.error)