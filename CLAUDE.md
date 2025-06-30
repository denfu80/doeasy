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

# Firebase emulator (after setup)
npm run firebase:emulator
```

### Project Structure
```
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                # Homepage router (switches between designs)
│   │   ├── list/[id]/page.tsx      # Individual todo list pages
│   │   └── globals.css             # Global styles with shadcn/ui variables
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
│   │   ├── debug-panel.tsx         # Development debugging
│   │   └── ui/                     # shadcn/ui components (Button, Badge, Card, Input)
│   ├── lib/
│   │   ├── firebase.ts             # Firebase configuration and setup
│   │   ├── firebase-test.ts        # Firebase connection testing
│   │   ├── name-generator.ts       # Funny name generation
│   │   ├── offline-storage.ts      # localStorage wrapper
│   │   └── utils.ts                # shadcn/ui utility functions
│   └── types/
│       └── todo.ts                 # TypeScript type definitions
├── design/                     # Design prototypes and requirements
├── components.json             # shadcn/ui configuration
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
- **Testing**: Write tests for critical functionality (to be added)
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

**⚠️ Firebase is required for the app to function.** No demo mode is available.

- Firebase Realtime Database for real-time todo synchronization
- Firebase Anonymous Authentication with SSR-safe implementation
- Direct signInAnonymously() without onAuthStateChanged delays
- Dynamic import with ssr: false to avoid Next.js SSR conflicts
- localStorage as backup system for data safety
- Human-readable list IDs using human-id package for better UX

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