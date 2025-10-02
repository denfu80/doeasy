# 🧪 Firebase Database Rules Testing

## Übersicht

Dieses Projekt unterstützt lokales Testen der Firebase Database Rules mit mehreren Ansätzen:

## 🚀 Schnellstart

### 1. Emulator starten
```bash
npm run firebase:emulators
```

### 2. Tests ausführen
```bash
# Alle Tests
npm test

# Nur Rules Tests
npm run test:rules

# Mit Watcher
npm run test:watch
```

## 📁 Test-Struktur

```
tests/
├── rules-test.js              # Haupt-Test-Suite (standalone)
├── rules-bolt-style.test.js   # Jest-basierte Tests
└── setup.js                   # Jest-Konfiguration
```

## 🔧 Test-Optionen

### Option 1: Standalone Testing (Empfohlen)
```bash
npm run test:rules
```
- ✅ Keine zusätzlichen Dependencies
- ✅ Läuft direkt mit Node.js
- ✅ Einfach zu verstehen

### Option 2: Jest Integration
```bash
npm test
```
- ✅ Strukturierte Test-Suites
- ✅ Watch-Mode verfügbar
- ✅ Coverage Reports

### Option 3: Emulator UI (Manuell)
```bash
npm run firebase:emulators
# Dann Browser öffnen: http://localhost:4000
```
- ✅ Visuelles Interface
- ✅ Realtime Database Explorer
- ✅ Rules Playground

## 📋 Was wird getestet

### Authentication Rules
- ❌ Unauthenticated access denied
- ✅ Authenticated users can read/write

### Data Validation
- Text field: nicht leer, max 500 Zeichen
- Color format: #RRGGBB hex format
- Name length: 1-50 Zeichen
- List ID format: alphanumeric + hyphens, 3-100 chars

### Access Control
- Users können nur eigene Presence schreiben
- Todos require proper creator fields
- Password system validation

## 🛠️ Eigene Tests hinzufügen

### Standalone Test erweitern
```javascript
// In tests/rules-test.js
async testMyCustomRule() {
  console.log('📝 Test: My custom rule')
  // Test implementation
  return true // or false
}
```

### Jest Test hinzufügen
```javascript
// In tests/rules-bolt-style.test.js
test('should enforce my custom rule', async () => {
  const result = await tester.testMyCustomRule()
  expect(result).toBe(true)
})
```

## 🚨 Troubleshooting

### "Permission denied" Fehler
✅ **Erwartet!** Das bedeutet, deine Rules funktionieren korrekt.

### Emulator startet nicht
```bash
# Firebase CLI installieren
npm install -g firebase-tools

# Projekt initialisieren
firebase login
firebase use doeasy-denfu
```

### Tests schlagen fehl
1. Emulator läuft? `npm run firebase:emulators`
2. Port 9000 frei?
3. Rules deployed? `npm run firebase:deploy:rules`

## 📚 Nützliche Commands

```bash
# Rules deployen (Emulator + Production)
npm run firebase:deploy:rules

# Nur Emulator Rules
firebase emulators:start --only database

# Emulator mit UI
firebase emulators:start --inspect-functions

# Tests mit Verbose Output
npm run test:rules -- --verbose
```

## 🎯 Best Practices

1. **Tests vor Rules schreiben** (TDD-Ansatz)
2. **Positive und negative Cases testen**
3. **Emulator für Development verwenden**
4. **Production Rules regelmäßig validieren**

## 📖 Weitere Ressourcen

- [Firebase Rules Simulator](https://firebase.google.com/docs/rules/simulator)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Database Rules Reference](https://firebase.google.com/docs/database/security)