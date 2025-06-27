import { humanId } from 'human-id'
import { ref, get } from 'firebase/database'
import { db, isFirebaseConfigured } from '@/lib/firebase'

/**
 * Generate human-readable IDs using the human-id library
 * Examples: "calm-snails-dream", "tasty-rocks-sparkle", "happy-lions-jump"
 */

/**
 * Check if a list ID already exists in Firebase
 * @param listId The ID to check
 * @returns Promise<boolean> - true if ID exists, false if available
 */
export async function checkIdExists(listId: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) {
    // In demo mode, check localStorage for existing IDs
    const existingIds = JSON.parse(localStorage.getItem('macheinfach-existing-ids') || '[]') as string[]
    return existingIds.includes(listId)
  }

  try {
    const listRef = ref(db, `lists/${listId}`)
    const snapshot = await get(listRef)
    return snapshot.exists()
  } catch (error) {
    console.error('Error checking ID existence:', error)
    // If we can't check, assume it exists to be safe
    return true
  }
}

/**
 * Generate a unique readable ID using human-id library
 * @param maxAttempts Maximum number of attempts to generate a unique ID
 * @returns Promise<string> - A guaranteed unique ID
 */
export async function generateUniqueReadableId(maxAttempts: number = 10): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate ID with lowercase and hyphen separator for URLs
    const candidateId = humanId({
      separator: '-',
      capitalize: false,
    })
    
    const exists = await checkIdExists(candidateId)
    if (!exists) {
      // Record this ID as used (for demo mode)
      if (!isFirebaseConfigured()) {
        const existingIds = JSON.parse(localStorage.getItem('macheinfach-existing-ids') || '[]') as string[]
        existingIds.push(candidateId)
        localStorage.setItem('macheinfach-existing-ids', JSON.stringify(existingIds))
      }
      
      console.log(`✅ Generated unique readable ID: ${candidateId}`)
      return candidateId
    }
    
    console.log(`ID collision detected: ${candidateId}, attempting again (${attempt + 1}/${maxAttempts})`)
  }

  // Fallback: add timestamp to ensure uniqueness
  const fallbackId = `${humanId({ separator: '-', capitalize: false })}-${Date.now().toString(36)}`
  
  // Record fallback ID as used (for demo mode)
  if (!isFirebaseConfigured()) {
    const existingIds = JSON.parse(localStorage.getItem('macheinfach-existing-ids') || '[]') as string[]
    existingIds.push(fallbackId)
    localStorage.setItem('macheinfach-existing-ids', JSON.stringify(existingIds))
  }
  
  console.warn(`Using fallback ID after ${maxAttempts} collision attempts: ${fallbackId}`)
  return fallbackId
}

/**
 * Pre-validate an ID before attempting to create a list
 * @param listId The ID to validate
 * @returns Promise<{valid: boolean, reason?: string}>
 */
export async function validateListId(listId: string): Promise<{valid: boolean, reason?: string}> {
  // Check format
  if (!listId || listId.length < 3) {
    return { valid: false, reason: 'ID too short' }
  }
  
  if (listId.length > 100) {
    return { valid: false, reason: 'ID too long' }
  }
  
  // Check for invalid characters (allow letters, numbers, hyphens)
  if (!/^[a-zA-Z0-9\-]+$/.test(listId)) {
    return { valid: false, reason: 'Invalid characters in ID' }
  }
  
  // Check if already exists
  const exists = await checkIdExists(listId)
  if (exists) {
    return { valid: false, reason: 'ID already exists' }
  }
  
  return { valid: true }
}

/**
 * Get info about the ID space
 */
export function getIdSpaceInfo() {
  return {
    poolSize: 15_000_000, // According to human-id docs
    format: 'adjective-noun-verb',
    examples: [
      'calm-snails-dream',
      'tasty-rocks-sparkle', 
      'happy-lions-jump',
      'rare-geckos-jam'
    ]
  }
}