import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

// Check if Firebase environment variables are configured
const isFirebaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  )
}

// Firebase configuration for Realtime Database
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://demo-project-default-rtdb.firebaseio.com/",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef"
}

let app: ReturnType<typeof initializeApp> | null = null
let auth: ReturnType<typeof getAuth> | null = null
let db: ReturnType<typeof getDatabase> | null = null

// Only initialize Firebase if configuration is available
if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getDatabase(app)
    console.log('✅ Firebase initialized successfully')
  } catch (error) {
    console.error('❌ Firebase initialization error:', error)
    // Reset to null if initialization fails
    app = null
    auth = null
    db = null
  }
} else {
  console.log('⚠️ Firebase not configured - running in demo mode')
}

export { auth, db }
export default app
export { isFirebaseConfigured }