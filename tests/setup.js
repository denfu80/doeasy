/**
 * Jest Setup für Firebase Rules Testing
 */

// Set Firebase Emulator environment variables
process.env.FIREBASE_DATABASE_EMULATOR_HOST = '127.0.0.1:9000'
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'

// Longer timeout for Firebase operations
jest.setTimeout(30000)

console.log('🔧 Jest setup: Firebase Emulator configured for testing')