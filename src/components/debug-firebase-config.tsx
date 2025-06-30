"use client"

import { useEffect } from 'react'

export default function DebugFirebaseConfig() {
  useEffect(() => {
    console.log('🔥 DEBUG: Firebase Environment Variables in Browser')
    console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    console.log('DATABASE_URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL)
    console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    console.log('STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    console.log('MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
    console.log('APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
    console.log('Is configured:', !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    ))
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded text-xs">
      DEBUG: Check console for Firebase config
    </div>
  )
}