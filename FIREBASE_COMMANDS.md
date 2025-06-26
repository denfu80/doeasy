# Firebase CLI Commands für mach.halt

## 🚀 Quick Commands

```bash
# Security Rules deployen
npm run firebase:deploy:rules

# Komplett-Deployment
npm run firebase:deploy

# Lokale Emulators starten
npm run firebase:emulators

# Verbindung testen
npm run firebase:test
```

## 📋 Alle verfügbaren Commands

### Development
```bash
npm run dev                    # Next.js Development Server
npm run firebase:emulators     # Firebase Emulators (DB + Hosting + UI)
npm run firebase:test          # Firebase Verbindungstest
```

### Deployment
```bash
npm run firebase:deploy        # Komplettes Firebase Deployment
npm run firebase:deploy:rules  # Nur Database Security Rules
npm run firebase:deploy:hosting # Nur Static Hosting
```

### Manual Firebase CLI
```bash
firebase login                 # Firebase einloggen
firebase use doeasy-denfu      # Projekt auswählen
firebase deploy --only database # Nur Rules deployen
firebase emulators:start       # Emulators starten
firebase database:get /        # Database Inhalt anzeigen
```

## 🔧 Erweiterte Commands

### Development Setup
```bash
# Erste Einrichtung
npm install -g firebase-tools
firebase login
firebase use doeasy-denfu

# Development starten
npm run firebase:emulators     # Terminal 1
npm run dev                    # Terminal 2
```

### Production Deployment
```bash
# Mit Validation Script
./scripts/deploy-firebase.sh

# Manual mit Checks
npm run type-check
npm run lint
npm run firebase:deploy
```

### Database Management
```bash
# Daten anzeigen
firebase database:get /lists/LISTID --pretty

# Rules testen
firebase database:rules:canRead /lists --as=auth.uid=testuser

# Emulator-spezifische Tests
firebase emulators:exec "npm test"
```

## 🌐 URLs

### Lokal (Emulators)
- **App**: http://localhost:3000
- **Database Emulator**: http://localhost:9000
- **Hosting Emulator**: http://localhost:5000
- **Emulator UI**: http://localhost:4000

### Production
- **Firebase Console**: https://console.firebase.google.com/project/doeasy-denfu
- **Database Rules**: https://console.firebase.google.com/project/doeasy-denfu/database/doeasy-denfu-default-rtdb/rules
- **Hosting**: https://doeasy-denfu.web.app (nach Hosting-Setup)
- **Authentication**: https://console.firebase.google.com/project/doeasy-denfu/authentication

## 🔐 Security Rules Status

✅ **Deployed Rules Features:**
- Authentifizierung erforderlich (auch anonymous)
- Todo-Strukturvalidierung (text, completed, createdAt, etc.)
- User Presence Management (nur eigene Presence editierbar)
- Datenvalidierung (Text max 500 Zeichen, Name max 50)
- Schutz vor unerwarteten Feldern

✅ **Database Structure:**
```
/lists/{listId}/
  ├── todos/{todoId}/        # Todos mit Validation
  ├── presence/{userId}/     # User Presence
  └── metadata/              # Liste-Metadaten (optional)

/test/                      # Verbindungstests
/stats/                     # Global Stats (readonly)
```

## 🐛 Troubleshooting

### Rules Deployment
```bash
# Rules Syntax prüfen
firebase database:rules:get

# Mit Debug-Info
firebase deploy --only database --debug
```

### Emulator Issues
```bash
# Emulator Reset
firebase emulators:start --import=./backup --export-on-exit

# Ports prüfen
lsof -i :9000  # Database Emulator
lsof -i :4000  # UI
```

### Authentication Issues
```bash
# Firebase neu einloggen
firebase logout
firebase login --reauth
```

## 📊 Monitoring & Debugging

### Logs anzeigen
```bash
# Deployment Logs
firebase deploy --debug

# Function Logs (falls später hinzugefügt)
firebase functions:log
```

### Database Monitoring
```bash
# Live Database Inhalt
firebase database:get / --pretty

# Specific List
firebase database:get /lists/LISTID --pretty

# User Presence
firebase database:get /lists/LISTID/presence --pretty
```