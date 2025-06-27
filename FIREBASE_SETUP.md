# Firebase Setup für mach.einfach

## 🔥 Firebase Realtime Database & Authentication Setup

### 1. Firebase Console Setup

1. Gehe zur [Firebase Console](https://console.firebase.google.com)
2. Wähle das Projekt `doeasy-denfu` (oder erstelle ein neues)

### 2. Authentication aktivieren

1. **In der Firebase Console:**
   - Gehe zu `Authentication` → `Sign-in method`
   - Aktiviere `Anonymous` Provider
   - Klicke auf `Enable` und `Save`

### 3. Realtime Database aktivieren

1. **In der Firebase Console:**
   - Gehe zu `Realtime Database`
   - Klicke auf `Create Database`
   - Wähle `Start in test mode` (für Development)
   - Wähle eine Region (z.B. `europe-west1`)

### 4. Database Security Rules (Development)

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ Wichtig:** Diese Regeln sind nur für Development! Für Production sichere Regeln implementieren.

### 5. Environment Variables

Die `.env.local` ist bereits mit den Werten aus `.firebase.conf` konfiguriert:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAHjnKRY8oiyn2sssaLwwAJJdj1CCNQIdc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=doeasy-denfu.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://doeasy-denfu-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=doeasy-denfu
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=doeasy-denfu.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=234745300690
NEXT_PUBLIC_FIREBASE_APP_ID=1:234745300690:web:568ad4bbe38ecb16a20f0b
```

### 6. Development Server neu starten

```bash
npm run dev
```

## ✅ Verification

Wenn alles korrekt konfiguriert ist:
- ✅ Keine "Demo Modus" Warnung
- ✅ Real-time Synchronisation zwischen Browser-Tabs
- ✅ User Presence (farbige Avatars) wird angezeigt
- ✅ Todos werden in Firebase gespeichert

## 🐛 Troubleshooting

### Error: `auth/configuration-not-found`
- Anonymous Authentication ist nicht aktiviert
- Gehe zu Firebase Console → Authentication → Sign-in method → Enable Anonymous

### Error: `permission-denied`
- Realtime Database Rules sind zu restriktiv
- Setze für Development die oben genannten Test-Rules

### Demo Modus bleibt aktiv
- Überprüfe alle Environment Variables in `.env.local`
- Development Server neu starten (`npm run dev`)
- Browser Cache leeren

## 📊 Database Structure

```
lists/
  {listId}/
    todos/
      {todoId}/
        - text: string
        - completed: boolean
        - createdAt: timestamp
        - createdBy: string
        - creatorName: string
    presence/
      {userId}/
        - name: string
        - color: string
        - onlineAt: timestamp
```