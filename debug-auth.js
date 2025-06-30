const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously, onAuthStateChanged } = require('firebase/auth');
const { getDatabase, ref, set, serverTimestamp } = require('firebase/database');

// Firebase config from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyAHjnKRY8oiyn2sssaLwwAJJdj1CCNQIdc",
  authDomain: "doeasy-denfu.firebaseapp.com",
  databaseURL: "https://doeasy-denfu-default-rtdb.firebaseio.com/",
  projectId: "doeasy-denfu",
  storageBucket: "doeasy-denfu.firebasestorage.app",
  messagingSenderId: "234745300690",
  appId: "1:234745300690:web:568ad4bbe38ecb16a20f0b"
};

async function debugFirebaseAuth() {
  console.log('🔥 Firebase Auth Debug - Starting...\n');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    console.log('🔗 Database URL:', firebaseConfig.databaseURL);
    console.log('🔐 Auth Domain:', firebaseConfig.authDomain);
    console.log('');
    
    // Check current auth state
    console.log('🔍 Checking current auth state...');
    console.log('Current user:', auth.currentUser ? auth.currentUser.uid : 'null');
    console.log('');
    
    // Try anonymous sign-in
    console.log('🔐 Attempting anonymous sign-in...');
    
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      console.log('✅ Anonymous sign-in successful!');
      console.log('User ID:', user.uid);
      console.log('Is anonymous:', user.isAnonymous);
      console.log('Provider data:', user.providerData.length);
      console.log('');
      
      // Test presence write
      console.log('🎯 Testing presence write...');
      const testListId = 'debug-test-list';
      const presenceRef = ref(db, `lists/${testListId}/presence/${user.uid}`);
      
      const presenceData = {
        name: 'Debug User',
        color: '#FF6B6B',
        onlineAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        isTyping: false,
        editingTodoId: null
      };
      
      await set(presenceRef, presenceData);
      console.log('✅ Presence write successful!');
      console.log('Written to path:', `lists/${testListId}/presence/${user.uid}`);
      console.log('');
      
      // Test todo write
      console.log('🎯 Testing todo write...');
      const todoRef = ref(db, `lists/${testListId}/todos/debug-todo-${Date.now()}`);
      
      const todoData = {
        text: 'Debug todo',
        completed: false,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        creatorName: 'Debug User'
      };
      
      await set(todoRef, todoData);
      console.log('✅ Todo write successful!');
      console.log('');
      
    } catch (authError) {
      console.error('❌ Anonymous sign-in failed:');
      console.error('Error code:', authError.code);
      console.error('Error message:', authError.message);
      console.error('');
      
      // Check if it's a specific auth error
      if (authError.code === 'auth/operation-not-allowed') {
        console.log('💡 This suggests Anonymous Authentication is not enabled in Firebase Console');
        console.log('   → Go to Firebase Console → Authentication → Sign-in method');
        console.log('   → Enable "Anonymous" provider');
      }
    }
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:');
    console.error(error.message);
  }
}

// Run the debug
debugFirebaseAuth().then(() => {
  console.log('🔥 Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});