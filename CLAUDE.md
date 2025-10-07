# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**"mach.einfach"** (previously "doeasy") is a fun, simple but intuitive todo app designed for seamless multi-user collaboration without registration requirements. Users can create and share todo lists via unique IDs for real-time collaboration. The app embraces a playful, modern aesthetic with the core message "zusammen sachen machen" (doing things together).

## Tech Stack

- **Frontend**: React + TypeScript + Next.js
- **UI Components**: shadcn/ui + Tailwind CSS
- **Database**: Firebase Realtime Database
- **Deployment**: Vercel
- **API Documentation**: Always check current APIs via Context7/MCP server

## Key Features

- **Dual design system** with playful and terminal-style alternatives
- **Environment variable-based design switching** (`NEXT_PUBLIC_HOMEPAGE_STYLE`)
- **Playful, modern UX/UI design** with "mach.einfach" branding
- **Alternative terminal/hacker aesthetic** for tech-savvy users
- **No user registration required** ("null registrierung")
- **Multi-user collaboration** via unique list IDs and shareable links
- **Real-time synchronization** across users ("live & smooth")
- **Smart delete system** with trash/restore functionality
- **Toast notifications** with undo options for better UX
- **Expandable avatar system** for inline name editing
- **Mobile-first responsive design** with gradients and animations
- **Single-action homepage** focusing on "MACHEN" (creating lists)
- **German language interface** with fun, energetic messaging
- **Guest access system** for read-only sharing
- **Pin/unpin lists** on homepage for quick access
- **Activity tracking** with last user action timestamps
- **User management page** for viewing active users
- **Password protection** for private lists (SHA-256 hashed, session-based unlocking)
- **Contextual tooltips** for guiding users to discover features (pin, name edit, password)

## Development Workflow

### Common Commands
```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Lint
npm run lint

# Type check
npm run type-check

# Install dependencies
npm install

# Install shadcn/ui components
npx shadcn@latest add [component-name]

# Example: Add more components
npx shadcn@latest add dialog toast

# Firebase emulator
npm run firebase:emulators

# Test Firebase database rules
npm run test:rules
```

### Project Structure
```
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root layout
│   │   ├── page.tsx                         # Homepage router (switches between designs)
│   │   ├── list/[id]/page.tsx              # Individual todo list pages
│   │   ├── list/[id]/guest/[guestId]/page.tsx  # Guest access (read-only)
│   │   ├── list/[id]/users/page.tsx        # User management page
│   │   └── globals.css                     # Global styles with shadcn/ui variables
│   ├── components/
│   │   ├── playful-homepage.tsx    # Main mach.einfach design (gradients, pink/purple)
│   │   ├── terminal-homepage.tsx   # Alternative terminal/hacker design
│   │   ├── todo-app.tsx            # Main todo app with Firebase integration
│   │   ├── todo-input.tsx          # Todo input component
│   │   ├── todo-list.tsx           # Todo list display
│   │   ├── todo-item.tsx           # Individual todo item
│   │   ├── user-avatars.tsx        # User presence and avatar system
│   │   ├── deleted-todos-trash.tsx # Trash/restore functionality
│   │   ├── toast-notification.tsx  # Toast notification system
│   │   ├── guest-todo-app.tsx      # Guest access component (read-only)
│   │   ├── sharing-modal.tsx       # Share options and link generation
│   │   ├── users-page.tsx          # User management interface
│   │   ├── password-prompt.tsx     # Password protection modal
│   │   ├── header-actions-menu.tsx # Mobile menu with pin/lock/share actions
│   │   ├── confirm-dialog.tsx      # Reusable confirmation dialog
│   │   ├── debug-panel.tsx         # Development debugging
│   │   └── ui/                     # shadcn/ui components (Button, Badge, Card, Input)
│   ├── lib/
│   │   ├── firebase.ts             # Firebase configuration and setup
│   │   ├── firebase-test.ts        # Firebase connection testing
│   │   ├── name-generator.ts       # Funny name generation
│   │   ├── offline-storage.ts      # localStorage wrapper
│   │   ├── readable-id-service.ts  # Human-readable ID generation
│   │   ├── realtime-test.ts        # Real-time functionality testing
│   │   └── utils.ts                # shadcn/ui utility functions
│   └── types/
│       └── todo.ts                 # TypeScript type definitions
├── tests/
│   └── rules-test.js           # Firebase rules testing (minimal setup)
├── design/                     # Design prototypes and requirements
├── components.json             # shadcn/ui configuration
├── firebase.json               # Firebase configuration with emulator setup
├── database.rules.json         # Firebase Realtime Database security rules
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS with shadcn/ui theme
└── tsconfig.json               # TypeScript configuration
```

## Development Guidelines

- **API Documentation**: Always verify current API documentation via Context7/MCP server before implementation
- **Component Development**: Use shadcn/ui components as base, customize with Tailwind CSS
- **State Management**: Use React hooks for local state, Firebase for shared state
- **Real-time Features**: Implement using Firebase Realtime Database listeners
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **TypeScript**: Strict typing for all components and functions
- **Code Style**: Follow Next.js and React best practices, use functional components with hooks
- **Testing**: Firebase rules testing with local emulator setup (`npm run test:rules`)
- **Performance**: Optimize for mobile devices, implement proper loading states
- **Branding**: Use "mach.einfach" consistently, maintain playful but professional tone
- **Animations**: Leverage Tailwind's built-in animations (animate-pulse, animate-bounce, etc.)

## Environment Configuration

### Design Switching
The homepage supports two distinct design variants controlled by environment variables:

```bash
# Playful design (default)
NEXT_PUBLIC_HOMEPAGE_STYLE=playful

# Terminal/hacker design
NEXT_PUBLIC_HOMEPAGE_STYLE=terminal
```

**Implementation Details:**
- `src/app/page.tsx` routes between `PlayfulHomepage` and `TerminalHomepage` components
- Default behavior: Falls back to playful design if variable not set
- Both designs maintain the same core functionality and messaging
- Allows A/B testing or different user experience preferences

## Firebase Integration

**✅ Firebase is fully configured and production-ready.**

- Firebase Realtime Database for real-time todo synchronization
- Firebase Anonymous Authentication with SSR-safe implementation
- Direct signInAnonymously() without onAuthStateChanged delays
- Dynamic import with ssr: false to avoid Next.js SSR conflicts
- localStorage as backup system for data safety
- Human-readable list IDs using human-id package for better UX
- **Comprehensive security rules** with validation and access control
- **Local testing setup** with Firebase Emulator Suite

### Firebase Testing

The project includes local Firebase rules testing:

```bash
# Start Firebase emulator
firebase emulators:start --only auth,database

# Run rules tests
npm run test:rules
```

Test setup includes:
- Authentication requirement validation
- Data structure validation
- User access control testing
- Minimal test framework for incremental development

## Feature Deep Dives

### Password Protection

**Overview:**
Lists can be protected with a password to restrict access. Users must enter the correct password to view or edit the list.

**Implementation Details:**
- **Location**: `src/components/todo-app.tsx`, `src/components/password-prompt.tsx`, `src/components/header-actions-menu.tsx`
- **Icon**: Lock (closed) when protected, Unlock (open) when not protected
- **Storage**: Password is hashed with SHA-256 and stored in Firebase at `lists/{listId}/metadata/password`
- **Session Management**: Successful unlock stores flag in `sessionStorage` for the current browser session
- **Guest Lists**: Guest links (`/list/[id]/guest/[guestId]`) bypass password protection completely

**User Flow:**
1. **Locking a List** (Setting Password):
   - User clicks Unlock icon (open lock)
   - Modal prompts for new password and confirmation
   - Password must match in both fields
   - Password is hashed with SHA-256 before storing
   - Success toast: "🔒 Liste ist jetzt passwortgeschützt"

2. **Accessing a Locked List** (Entering Password):
   - When loading a password-protected list, modal appears automatically
   - User enters password
   - Password is hashed and compared with stored hash
   - On success: **Zugang gewährt** (access granted, list stays locked)
   - Session is marked as unlocked: `sessionStorage.setItem('unlocked-{listId}', 'true')`
   - On failure: Error message "Falsches Passwort"
   - Cancel redirects to homepage
   - Success toast: "✅ Zugang gewährt"

3. **Removing Password Protection** (Unlocking the List):
   - User clicks Lock icon (closed lock)
   - Modal prompts for current password verification (remove mode)
   - On success: Password is **permanently removed** from Firebase
   - List is now completely unprotected
   - Success toast: "🔓 Passwortschutz wurde entfernt"

**Technical Implementation:**
```typescript
// Password modes
type PasswordMode = 'set' | 'verify' | 'remove'

// 'set' - Create new password protection
// 'verify' - Grant access to locked list (does not remove password)
// 'remove' - Remove password protection permanently

// Password hashing (client-side, SHA-256)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Firebase structure
lists/{listId}/metadata/password: {
  hashedPassword: string (64 chars, SHA-256 hex)
  createdBy: string
  createdAt: timestamp
  updatedAt?: timestamp
}

// Session-based access (not unlocking!)
// Grants access for current session, list remains password-protected
sessionStorage.setItem(`unlocked-${listId}`, 'true')
```

**UI/UX Notes:**
- Lock button shows green background when list is protected
- Button pulses gently if password hint tooltip is active
- Mobile: Lock option appears in HeaderActionsMenu dropdown
- Desktop: Lock button appears next to Pin and Share buttons
- Note in sharing modal: Guest links explicitly state "Kein Passwortschutz"

**Important Warnings:**
- ⚠️ **No password recovery**: If password is lost, there is no way to recover access
- ⚠️ **Not for sensitive data**: This tool is not designed for storing sensitive information
- These warnings are displayed prominently in the password modals

**Access Control:**
- **List View** (`/list/[id]`): Password prompt blocks all content until correct password is entered
- **Users View** (`/list/[id]/users`): Same password protection applies - users page is also locked
- **Guest View** (`/guest/[guestId]`): No password protection - always accessible
- When password prompt is cancelled, user is redirected to homepage
- **Session-based access** (NOT unlocking!):
  - Once password is verified, access is granted for the current browser session
  - List remains password-protected in Firebase
  - New tab/window requires password again
  - Closing browser clears sessionStorage → password required again
  - To **remove** password protection, use Lock icon (requires verification)

### Contextual Tooltip System

**Overview:**
The app uses contextual tooltips to guide users to discover features without overwhelming the UI. Tooltips appear automatically once per list per feature, with staggered timing to avoid collisions.

**Pattern:**
```typescript
// Tooltip state
const [hasShownFeatureHint, setHasShownFeatureHint] = useState(false)

// localStorage key pattern
const hintKey = `feature-hint-shown-${listId}`
const hasShownBefore = localStorage.getItem(hintKey) === 'true'

// Show logic (in useEffect)
if (!hasShownBefore && isAuthReady && otherConditions) {
  setTimeout(() => {
    setToastMessage('💡 Tipp: Feature-Beschreibung')
    setToastType('info')
    setToastVisible(true)
    setHasShownFeatureHint(true)
    localStorage.setItem(hintKey, 'true')

    // Auto-stop visual indicator after 8 seconds
    setTimeout(() => {
      setHasShownFeatureHint(false)
    }, 8000)
  }, delayInMs)
}
```

**Implemented Tooltips:**
1. **Pin Hint** (Delay: 0ms, immediately after auth ready)
   - Key: `pin-hint-shown-${listId}`
   - Message: "💡 Tipp: Pinne diese Liste, um sie schnell wiederzufinden!"
   - Condition: List is not pinned
   - Visual: Pin button pulses with `gentle-pulse-animation` class

2. **Name Edit Hint** (Delay: 5000ms)
   - Key: `name-hint-shown-${listId}`
   - Message: "✨ Tipp: Hover über deinen Avatar, um deinen Namen anzupassen!"
   - Condition: User has not customized their name (`macheinfach-username-customized !== 'true'`)
   - Visual: User's own avatar pulses

3. **Password Hint** (Delay: 10000ms)
   - Key: `password-hint-shown-${listId}`
   - Message: "🔒 Tipp: Schütze diese Liste mit einem Passwort!"
   - Condition: List is not password-protected and is unlocked
   - Visual: Lock/Unlock button pulses

**Best Practices:**
- **Stagger timing**: Each tooltip has increasing delay to avoid overlapping (0ms, 5s, 10s, etc.)
- **Per-list tracking**: Use `${listId}` in localStorage key to show hints once per list
- **Visual indicators**: Use `gentle-pulse-animation` CSS class for 8 seconds
- **Auto-dismissal**: Visual indicators stop after 8 seconds, but toast can be manually dismissed
- **Condition checks**: Always check relevant state before showing (e.g., isPinned, hasCustomName, isPasswordProtected)

**CSS Animation:**
```css
@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.gentle-pulse-animation {
  animation: gentle-pulse 2s ease-in-out infinite;
}
```

## Current Setup Status

✅ **Completed:**
- Next.js 15.3.4 with TypeScript
- Tailwind CSS configuration with custom animations
- ESLint configuration
- shadcn/ui component library (Button, Badge, Card, Input)
- Project structure with design prototypes
- Firebase dependency installed
- **Final homepage design implemented** ("mach.einfach" branding)
- **Firebase Realtime Database integration** with security rules
- **Complete todo management system** (CRUD operations)
- **Real-time collaboration features** with user presence
- **Smart delete system** with trash/restore functionality
- **Toast notification system** with undo options
- **Expandable avatar system** for name editing
- **Dual design system** (playful + terminal)
- **Human-readable list IDs** using human-id package
- **Firebase Auth with SSR-safe implementation** (no demo mode)
- **Backup system** with localStorage for data safety
- **Comprehensive user stories** and documentation

🎯 **Production Ready:**
- Core functionality complete
- Real-time collaboration working
- Firebase rules deployed
- Demo mode for development
- Mobile-responsive design
- German language interface
- Documentation and README complete

## User Story Development

Before implementing features, collaborate on user stories that define:
- Core user workflows (creating, joining, managing todo lists)
- Multi-user collaboration scenarios (real-time updates, conflict resolution)
- Mobile and desktop user experiences (responsive design)
- Error handling and edge cases (offline mode, network errors)

## Design System

### Playful Design (Default)
✅ **Implemented in `playful-homepage.tsx`:**
- **Branding**: "mach.einfach" with playful pink accent and rotating Zap icon
- **Typography**: Bold "zusammen sachen machen" with colorful rotations
- **Color Palette**: Pink to Purple to Blue gradients with floating decorative elements
- **Messaging**: "null registrierung", "instant flow", "live & smooth"
- **Interactive Elements**: Hover animations, floating UI badges, gradient buttons
- **Layout**: Centered single-action design with big "MACHEN" button
- **Style**: Modern, fun, energetic aesthetic with pastel backgrounds

### Terminal Design (Alternative)
✅ **Implemented in `terminal-homepage.tsx`:**
- **Branding**: "mach.einfach v2.0.1" with hacker-style ASCII art header
- **Typography**: Monospace font family throughout, bold terminal commands
- **Color Palette**: Green-on-black terminal theme with accent colors (red, yellow, blue, pink)
- **Messaging**: Same core message in terminal/command-line format
- **Interactive Elements**: Typing animations, terminal window styling, command prompts
- **Layout**: Two-column layout with terminal output and system status
- **Style**: Retro terminal/hacker aesthetic with authentic command-line feel

**Shared Design Principles:**
- Intuitive understanding without reading (visual first)
- Single primary action: "MACHEN" or "./neue-liste --start" button
- Collaboration visually communicated (floating elements vs. system status)
- Simplicity emphasized with consistent messaging
- Mobile-first responsive design for both variants

## Technology Implementation Notes

- **Next.js App Router**: Use for modern routing and server components
- **shadcn/ui**: Component library for consistent UI elements (Button, Badge, Card, Input)
- **Firebase Realtime Database**: For real-time multi-user collaboration
- **Unique List IDs**: Generate shareable URLs for todo lists
- **No Authentication**: Keep it simple, no user registration required
- **Vercel Deployment**: Optimized for Next.js apps
- **Lucide Icons**: For consistent iconography (Plus, Zap, Users, ArrowRight)
- **Custom Animations**: Tailwind CSS animations for interactive elements
- **Gradient Design**: Pink-Purple-Blue color scheme throughout the app

# Lessons Learned - Vercel Build Errors

## Häufigste Build-Fehler nach Refactoring

### 1. Funktion/Variable gelöscht aber noch verwendet
**Problem:** Import/State entfernt → Code nutzt sie noch
**Symptom:** `Cannot find name 'X'`

**Checkliste vor dem Löschen:**
```bash
# Suche ALLE Verwendungen
grep -r "functionName" src/
grep -r "stateName" src/
```

**Beispiel:**
```typescript
// ❌ Fehler
import { filterUsers } from '@/lib/utils'  // Import entfernt
// Aber Code nutzt es noch:
const filtered = filterUsers(users)  // Build Error!

// ✅ Richtig
// 1. Grep nach "filterUsers" in src/
// 2. ALLE Verwendungen ersetzen/löschen
// 3. Dann Import entfernen
```

### 2. useEffect Dependencies nicht aktualisiert
**Problem:** State Variable gelöscht → useEffect referenziert sie noch
**Symptom:** `Cannot find name 'X'` in dependency array

**Checkliste:**
- [ ] useEffect dependency arrays prüfen
- [ ] useCallback dependency arrays prüfen
- [ ] useMemo dependency arrays prüfen

**Beispiel:**
```typescript
// ❌ Fehler
const [showAll, setShowAll] = useState(false)  // State gelöscht
}, [isReady, showAll])  // Build Error!

// ✅ Richtig
}, [isReady])  // showAll aus Array entfernt
```

### 3. Unused Imports (Warnings)
**Problem:** Icons/Module importiert aber nicht verwendet
**Symptom:** ESLint Warnings (kein Build Error, aber cleanup nötig)

**Checkliste:**
```bash
npm run lint  # Zeigt alle Warnings
```

## Pre-Push Checkliste

### ✅ IMMER vor Push ausführen:
```bash
# 1. Type Check
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Build Test
npm run build
```

### 🔍 Bei Refactoring zusätzlich:
```bash
# Suche nach gelöschten Symbolen
grep -r "deletedFunctionName" src/
grep -r "deletedStateName" src/
grep -r "DeletedComponent" src/
```

### ⚠️ Besonders kritisch:
- React Hook Dependencies (useEffect, useCallback, useMemo)
- Props Interfaces vs. tatsächliche Props
- Import Statements vs. tatsächliche Verwendung

## Vercel Build vs. Local Build

**Unterschiede:**
- Vercel: Fresh `node_modules`, kein Cache
- Vercel: Strict TypeScript Mode
- Local: Manchmal gecachte Errors

**Best Practice - Simuliere Vercel lokal:**
```bash
rm -rf node_modules .next
npm install
npm run build
```

## Quick Reference

| Fehlertyp | Check Command |
|-----------|---------------|
| Missing Function/Var | `grep -r "name" src/` |
| Type Error | `npx tsc --noEmit` |
| Build Error | `npm run build` |
| Unused Imports | `npm run lint` |

## Zusammenfassung

**Root Causes (90% aller Build Errors):**
1. Funktion/Variable gelöscht → noch irgendwo verwendet
2. useEffect dependencies nicht aktualisiert
3. Imports entfernt → Code nutzt sie noch

**Lösung:**
- ✅ **IMMER** `npm run build` lokal VOR Push
- ✅ **GREP** nach gelöschten Symbolen
- ✅ **TypeScript** ernst nehmen (nicht nur ESLint)
