# Firebase Rules Testing

Einfache Anleitung zum Testen der Firebase Database Rules.

## 🚀 Quick Start

```bash
# Terminal 1: Emulator starten
firebase emulators:start --only auth,database

# Terminal 2: Tests ausführen
npm run test:rules
```

## 📁 Test-Setup

```
tests/
└── rules-test.js    # Minimaler Test-Setup für schrittweise Entwicklung
```

## 🧪 Aktueller Test

Der Basis-Test prüft:

- ❌ **Unauthenticated Access** - Zugriff ohne Login wird blockiert
- ✅ **Authenticated Access** - Zugriff mit Anonymous Auth funktioniert
- ✅ **Basic Write/Read** - Todo erstellen und lesen

## 🔧 Neue Tests hinzufügen

In `tests/rules-test.js`:

```javascript
// Neuen Test hinzufügen
async testMyFeature() {
  console.log('\n📝 Test: My Feature')

  try {
    // Test-Logic hier
    const result = await someOperation()
    console.log('✅ PASS: Feature works')
    return true
  } catch (error) {
    console.log('❌ FAIL:', error.code)
    return false
  }
}

// In runTests() einbinden:
async runTests() {
  await this.setup()

  const results = []
  results.push(await this.testBasicAuth())
  results.push(await this.testMyFeature()) // <-- hier hinzufügen

  // Results handling...
}
```

## 🎯 Häufige Test-Patterns

### Data Validation Test
```javascript
// Testen ob leerer Text abgelehnt wird
await set(ref, { text: "" }) // Should fail with PERMISSION_DENIED
```

### Access Control Test
```javascript
// Testen ob andere User-Daten geschützt sind
await set(ref(db, `presence/${otherUserId}`), data) // Should fail
```

### Format Validation Test
```javascript
// Testen ob Farb-Format validiert wird
await set(ref, { color: "red" }) // Should fail (not hex format)
```

## 🛠️ Troubleshooting

### Tests schlagen fehl
1. ✅ Emulator läuft? `firebase emulators:start --only auth,database`
2. ✅ Port 9000/9099 frei?
3. ✅ Rules korrekt? Siehe `database.rules.json`

### "PERMISSION_DENIED" ist oft korrekt!
Das bedeutet, deine Rules funktionieren und blockieren unerlaubte Zugriffe.

## 📚 Nächste Schritte

- Tests für Guest-Access System
- Tests für List Metadata
- Tests für User Presence System
- Tests für Smart Delete/Restore

Jeder neue Test wird schrittweise basierend auf App-Features entwickelt.