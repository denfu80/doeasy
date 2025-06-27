import { humanId } from 'human-id'

/**
 * Generate human-readable IDs using the human-id library
 * Examples: "calm-snails-dream", "tasty-rocks-sparkle", "happy-lions-jump"
 * 
 * With 15 million possible combinations, collision probability is negligible
 * for typical app usage (even 10,000 lists = 0.067% collision chance)
 */

/**
 * Generate a readable ID using human-id library
 * @returns string - A readable ID like "calm-snails-dream"
 */
export function generateReadableId(): string {
  // Generate ID with lowercase and hyphen separator for URLs
  return humanId({
    separator: '-',
    capitalize: false,
  })
}

/**
 * Validate an ID format (for URL parameters)
 * @param listId The ID to validate
 * @returns {valid: boolean, reason?: string}
 */
export function validateListId(listId: string): {valid: boolean, reason?: string} {
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