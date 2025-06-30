import { ref, onValue, off, set } from 'firebase/database'
import { db, isFirebaseConfigured } from './firebase'

export interface RealtimeTestResult {
  success: boolean
  latency: number
  error?: string
}

export async function testRealtimeSync(listId: string): Promise<RealtimeTestResult> {
  if (!isFirebaseConfigured() || !db) {
    return {
      success: false,
      latency: 0,
      error: 'Firebase not configured'
    }
  }

  const testRef = ref(db, `lists/${listId}/test`)
  const startTime = Date.now()
  let resolved = false

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        off(testRef)
        resolve({
          success: false,
          latency: Date.now() - startTime,
          error: 'Timeout after 5 seconds'
        })
      }
    }, 5000)

    // Listen for the test data
    const unsubscribe = onValue(testRef, (snapshot) => {
      if (!resolved && snapshot.exists()) {
        const data = snapshot.val()
        if (data.testId === 'realtime-test') {
          resolved = true
          clearTimeout(timeout)
          off(testRef, 'value', unsubscribe)
          
          // Clean up test data
          set(testRef, null)
          
          resolve({
            success: true,
            latency: Date.now() - startTime,
          })
        }
      }
    }, (error) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve({
          success: false,
          latency: Date.now() - startTime,
          error: error.message
        })
      }
    })

    // Write test data
    setTimeout(() => {
      if (!resolved) {
        set(testRef, {
          testId: 'realtime-test',
          timestamp: Date.now()
        }).catch((error) => {
          if (!resolved) {
            resolved = true
            clearTimeout(timeout)
            off(testRef, 'value', unsubscribe)
            resolve({
              success: false,
              latency: Date.now() - startTime,
              error: error.message
            })
          }
        })
      }
    }, 100)
  })
}

export async function testMultiTabSync(): Promise<{
  supportsMultiTab: boolean
  instructions: string[]
}> {
  return {
    supportsMultiTab: true,
    instructions: [
      '1. Öffne diese URL in einem neuen Tab oder Fenster',
      '2. Erstelle ein Todo in einem Tab',
      '3. Überprüfe, ob es sofort im anderen Tab erscheint',
      '4. Editiere oder lösche das Todo in einem Tab',
      '5. Verifiziere die Synchronisation im anderen Tab'
    ]
  }
}

// Browser-Console Helper
if (typeof window !== 'undefined') {
  ;(window as any).realtimeTest = {
    testSync: testRealtimeSync,
    testMultiTab: testMultiTabSync
  }
}