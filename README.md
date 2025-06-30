# mach.einfach

**Zusammen Sachen machen** - Eine spielerische, kollaborative Todo-App ohne Registrierung

## 🎯 Was ist mach.einfach?

mach.einfach ist eine moderne, echtzeitfähige Todo-App, die es Teams ermöglicht, sofort zusammenzuarbeiten - ohne Registrierung, ohne Komplexität, einfach **machen**.

### ✨ Kernfeatures

- **🚀 Null Registrierung** - Sofort loslegen, keine Anmeldung erforderlich
- **⚡ Real-time Kollaboration** - Live-Updates zwischen allen Nutzern
- **🎨 Dual Design System** - Playful & Terminal-Style verfügbar
- **📱 Mobile-First** - Perfekt optimiert für alle Geräte
- **🗂️ Smart Mülleimer** - Todos wiederherstellen statt verlieren
- **🔄 Backup-System** - Automatische lokale Sicherung der Daten
- **🔗 Einfaches Teilen** - Ein Link, alle können mitmachen

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Firebase Realtime Database
- **Auth**: Firebase Anonymous Authentication
- **Deployment**: Vercel
- **Icons**: Lucide React

## 🏗️ Projekt Setup

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Firebase-Projekt (erforderlich für Kollaboration)

### Installation

```bash
# Repository klonen
git clone https://github.com/your-username/mach-einfach.git
cd mach-einfach

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App läuft dann unter `http://localhost:3000`

### Firebase Setup (Erforderlich)

Für Real-time Kollaboration:

1. Firebase-Projekt erstellen: https://console.firebase.google.com
2. Realtime Database aktivieren
3. Anonymous Authentication aktivieren
4. Environment Variables setzen:

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

5. Firebase Rules deployen:
```bash
npm run firebase:deploy:rules
```

**Firebase ist erforderlich** für echte Kollaboration. Ohne Firebase zeigt die App eine Fehlermeldung.

## 🎨 Design-Modi

Die App unterstützt zwei visuelle Stile:

### Playful Design (Standard)
```bash
NEXT_PUBLIC_HOMEPAGE_STYLE=playful
```
- Moderne Gradients (Pink → Purple → Blue)
- Spielerische Animationen
- "mach.einfach" Branding mit Zap-Icon

### Terminal Design
```bash
NEXT_PUBLIC_HOMEPAGE_STYLE=terminal
```
- Retro Hacker-Ästhetik
- Grün-auf-Schwarz Terminal-Theme
- ASCII-Art und Command-Line Stil

## 📋 Hauptfunktionen

### Todo-Management
- ➕ **Hinzufügen**: Schnell neue Todos erstellen
- ✅ **Abhaken**: Todos als erledigt markieren
- ✏️ **Editieren**: Inline-Bearbeitung per Doppelklick
- 🗑️ **Löschen**: Soft-Delete mit Wiederherstellen-Option

### Mülleimer-System
- **Smart Delete**: Todos werden nicht sofort gelöscht
- **Toast-Benachrichtigung**: Sofortiges Undo nach dem Löschen
- **Mülleimer-Panel**: Überblick über alle gelöschten Todos
- **Batch-Operationen**: 
  - Einzelne Todos wiederherstellen
  - Einzelne Todos endgültig löschen
  - Alle Todos auf einmal löschen
- **Automatische Bereinigung**: Nur die letzten 10 gelöschten Todos

### Real-time Kollaboration
- **Live-Updates**: Änderungen erscheinen sofort bei allen
- **Nutzer-Präsenz**: Sehen wer gerade online ist
- **Avatar-System**: Farbige Initialen für alle Teilnehmer
- **Expandable Avatars**: Eigenen Namen per Klick editieren

### Sharing & Links
- **Unique URLs**: Jede Liste hat eine eindeutige ID
- **Ein-Klick Teilen**: Link kopieren und versenden
- **Sofortiger Zugang**: Keine Registrierung für Teilnehmer

## 🔧 Development

### Verfügbare Scripts

```bash
# Entwicklung
npm run dev              # Development Server
npm run build           # Production Build
npm run start           # Production Server

# Code-Qualität
npm run lint            # ESLint
npm run type-check      # TypeScript Check

# Firebase
npm run firebase:emulators       # Lokale Firebase Emulatoren
npm run firebase:deploy:rules    # Nur Database Rules
npm run firebase:deploy:hosting  # Nur Hosting
npm run firebase:deploy         # Komplett Deploy
npm run firebase:test           # Connection Test
```

### Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage (Design-Router)
│   ├── list/[id]/         # Todo-Listen Seiten
│   ├── layout.tsx         # Root Layout
│   └── globals.css        # Global Styles
├── components/
│   ├── playful-homepage.tsx    # Standard Design
│   ├── terminal-homepage.tsx   # Terminal Design
│   ├── todo-app.tsx           # Haupt-App Logik
│   ├── todo-input.tsx         # Input-Komponente
│   ├── todo-list.tsx          # Listen-Darstellung
│   ├── todo-item.tsx          # Einzelnes Todo
│   ├── user-avatars.tsx       # Avatar-System
│   ├── deleted-todos-trash.tsx # Mülleimer
│   ├── toast-notification.tsx # Toast-System
│   └── ui/                    # shadcn/ui Komponenten
├── lib/
│   ├── firebase.ts           # Firebase Konfiguration
│   ├── name-generator.ts     # Lustige Namen
│   ├── offline-storage.ts    # localStorage Wrapper
│   └── utils.ts             # shadcn/ui Utils
└── types/
    └── todo.ts              # TypeScript Types
```

### Code-Konventionen

- **TypeScript strict mode** für alle Dateien
- **Functional Components** mit React Hooks
- **shadcn/ui** als Basis für UI-Komponenten
- **Tailwind CSS** für Styling
- **Firebase Realtime Database** für Echtzeitdaten
- **localStorage** als Backup-System

## 🚀 Deployment

### Vercel (Empfohlen)

1. Repository zu Vercel connecten
2. Environment Variables setzen
3. Deploy - fertig!

Automatische Deployments bei Git Push.

### Firebase Hosting

```bash
# Build für Hosting
npm run firebase:deploy:hosting
```

### Andere Plattformen

Da es eine statische Next.js App ist, funktioniert Deployment auf:
- Netlify
- GitHub Pages
- Cloudflare Pages
- Jeder statische Hosting-Service

## 🛡️ Sicherheit & Datenschutz

- **Anonymous Authentication**: Keine persönlichen Daten
- **Firebase Security Rules**: Schutz vor unauthorisiertem Zugriff
- **Liste-basierte Isolation**: Listen sind nur über URL zugänglich
- **Keine Tracking**: Minimale Datensammlung
- **GDPR-konform**: Anonyme Nutzung ohne Personenbezug

## 🎮 Nutzung

### Liste erstellen
1. Auf Homepage "MACHEN" klicken
2. Automatische Weiterleitung zur neuen Liste
3. Lustiger Name wird automatisch generiert

### Kollaboration
1. Link der Liste kopieren ("Teilen" Button)
2. Link an Teammitglieder senden
3. Sofortige Kollaboration ohne Registrierung

### Todos verwalten
- **Hinzufügen**: Text eingeben + Enter
- **Abhaken**: Checkbox klicken
- **Editieren**: Doppelklick auf Todo-Text
- **Löschen**: X-Button → Toast mit Undo-Option

### Mülleimer nutzen
- **Wiederherstellen**: Toast-Button oder Mülleimer-Panel
- **Endgültig löschen**: Rotes X im Mülleimer
- **Alles löschen**: "Alles löschen" Button im Mülleimer

## 🤝 Contributing

Contributions sind willkommen! 

1. Fork des Repositories
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Changes committen (`git commit -m 'Add AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

### Development Guidelines

- Follow existing code style
- Add TypeScript types for new features
- Update documentation for user-facing changes
- Test features with Firebase configuration

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- [shadcn/ui](https://ui.shadcn.com/) für die UI-Komponenten
- [Lucide](https://lucide.dev/) für die Icons
- [Tailwind CSS](https://tailwindcss.com/) für das Styling
- [Firebase](https://firebase.google.com/) für die Backend-Services
- [Vercel](https://vercel.com/) für das Hosting

---

**Zusammen Sachen machen** 🚀

Erstellt mit ❤️ für effektive Teamarbeit ohne Hindernisse.