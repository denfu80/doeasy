// Firebase Realtime Database Quick Test Script
// Run with: node firebase-quick-test.js

const https = require('https')

const FIREBASE_URL = 'https://doeasy-denfu-default-rtdb.firebaseio.com'
const TEST_PATH = '/test/connection.json'

console.log('🔥 Testing Firebase Realtime Database connection...')
console.log(`📡 URL: ${FIREBASE_URL}${TEST_PATH}`)

// Test 1: Check if database is reachable
https.get(`${FIREBASE_URL}${TEST_PATH}`, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    console.log(`📊 Response Status: ${res.statusCode}`)
    console.log(`📝 Response Data: ${data}`)
    
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(data)
        console.log('✅ Database is reachable!')
        
        if (parsed === null) {
          console.log('📭 No test data found (this is normal)')
        } else {
          console.log('📦 Test data exists:', parsed)
        }
      } catch (e) {
        console.log('⚠️ Response is not valid JSON')
      }
    } else if (res.statusCode === 401) {
      console.log('🔒 Authentication required - this is expected for a secure database')
      console.log('💡 The database exists but requires proper authentication')
    } else if (res.statusCode === 404) {
      console.log('❌ Database not found - check the URL')
    } else {
      console.log(`⚠️ Unexpected status code: ${res.statusCode}`)
    }
    
    console.log('\n📋 Next Steps:')
    console.log('1. Enable Firebase Authentication in console.firebase.google.com')
    console.log('2. Go to Authentication → Sign-in method → Enable Anonymous')
    console.log('3. Go to Realtime Database → Rules → Set to test mode:')
    console.log('   {')
    console.log('     "rules": {')
    console.log('       ".read": true,')
    console.log('       ".write": true')
    console.log('     }')
    console.log('   }')
    console.log('4. Restart the development server: npm run dev')
  })
}).on('error', (err) => {
  console.log('❌ Connection failed:', err.message)
  console.log('\n🔧 Possible issues:')
  console.log('- Network connectivity problems')
  console.log('- Firewall blocking the connection')
  console.log('- Invalid Firebase URL')
})