# Firebase Deployment Guide

## 🚀 Schnell-Start

```bash
# 1. Firebase Rules deployen
npm run firebase:deploy:rules

# 2. Komplett-Deployment (Rules + Hosting)
npm run firebase:deploy

# 3. Nur Hosting deployen
npm run firebase:deploy:hosting
```

## 📋 Voraussetzungen

1. **Firebase CLI installiert**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Login**:
   ```bash
   firebase login
   ```

3. **Projekt auswählen**:
   ```bash
   firebase use doeasy-denfu
   ```

## 🔐 Security Rules

### Aktuelle Rules (`database.rules.json`):

- **Authentication**: Nur authentifizierte User (auch anonymous)
- **Todo Validation**: Strukturvalidierung für alle Todo-Felder
- **Presence Management**: User können nur ihre eigene Presence ändern
- **Data Limits**: Text max 500 Zeichen, Name max 50 Zeichen
- **Field Protection**: Verhindert zusätzliche/unerwartete Felder

### Deployment Commands:

```bash
# Nur Database Rules
npm run firebase:deploy:rules

# Mit Validation Script
./scripts/deploy-firebase.sh

# Manual
firebase deploy --only database
```

## 🌐 Hosting Setup

### Build & Deploy:

```bash
# Automatisch
npm run firebase:deploy:hosting

# Manual
npm run build
npx next export
firebase deploy --only hosting
```

### Hosting Features:

- **Static Export**: Next.js App als statische Dateien
- **SPA Routing**: Alle Routes zu index.html
- **Cache Headers**: Optimierte Caching-Strategien
- **Custom Domain**: Konfigurierbar über Firebase Console

## 🧪 Testing & Validation

### Lokale Emulators:

```bash
# Alle Emulators starten
npm run firebase:emulators

# Oder manual
firebase emulators:start
```

**Emulator URLs:**
- Database: http://localhost:9000
- Hosting: http://localhost:5000
- UI: http://localhost:4000

### Quick Tests:

```bash
# Firebase Verbindung testen
npm run firebase:test

# Manual connection test
node firebase-quick-test.js
```

## 📁 Dateistruktur

```
├── firebase.json              # Firebase Projektkonfiguration
├── .firebaserc               # Projekt-Aliase
├── database.rules.json       # Realtime Database Security Rules
├── scripts/
│   └── deploy-firebase.sh    # Deployment Script mit Validation
└── FIREBASE_DEPLOYMENT.md    # Diese Anleitung
```

## 🔧 Konfiguration

### Database Rules Struktur:

```
/lists/{listId}/
  ├── todos/{todoId}
  │   ├── text: string (1-500 chars)
  │   ├── completed: boolean
  │   ├── createdAt: timestamp
  │   ├── createdBy: string (auth.uid)
  │   └── creatorName: string (1-50 chars)
  ├── presence/{userId}
  │   ├── name: string (1-50 chars)
  │   ├── color: string (#RRGGBB)
  │   ├── onlineAt: timestamp|null
  │   ├── lastSeen: timestamp
  │   └── isTyping: boolean
  └── metadata/ (optional)
      ├── title: string
      ├── createdAt: timestamp
      └── createdBy: string
```

### Environment Variables:

Für Production-Deployment in `.env.production`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=doeasy-denfu.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://doeasy-denfu-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=doeasy-denfu
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=doeasy-denfu.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=234745300690
NEXT_PUBLIC_FIREBASE_APP_ID=1:234745300690:web:568ad4bbe38ecb16a20f0b
```

## 🐛 Troubleshooting

### Rules Deployment Fehler:

```bash
# Rules Syntax prüfen
firebase database:rules:get

# Emulator für lokale Tests
firebase emulators:start --only database
```

### Hosting Deployment Fehler:

```bash
# Build lokal testen
npm run build
npx next export

# Static files prüfen
ls -la out/
```

### Permission Errors:

```bash
# Firebase neu einloggen
firebase logout
firebase login

# Projekt neu zuweisen
firebase use --add
```

## 📊 Monitoring

### Firebase Console Links:

- **Database Rules**: https://console.firebase.google.com/project/doeasy-denfu/database/doeasy-denfu-default-rtdb/rules
- **Hosting**: https://console.firebase.google.com/project/doeasy-denfu/hosting
- **Authentication**: https://console.firebase.google.com/project/doeasy-denfu/authentication
- **Usage**: https://console.firebase.google.com/project/doeasy-denfu/usage

### Performance Monitoring:

```bash
# Deployment Logs
firebase deploy --debug

# Database Usage
firebase database:profile
```

## 🔄 CI/CD Integration

Für GitHub Actions oder andere CI/CD:

```yaml
# .github/workflows/firebase-deploy.yml
- name: Deploy to Firebase
  run: |
    npm ci
    npm run firebase:deploy
  env:
    FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Firebase Token generieren:
```bash
firebase login:ci
```