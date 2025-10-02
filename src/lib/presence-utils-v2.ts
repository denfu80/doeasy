/**
 * Presence Utility Functions V2
 * Clean TDD approach - only using lastSeen
 */

import { User } from '@/types/todo'
import { ONLINE_THRESHOLD_MS } from './presence-config'

/**
 * Check if a user is currently online
 * Only uses lastSeen timestamp
 * @param user - User object to check
 * @returns true if user is online (active within last 2 minutes)
 */
export const isUserOnline = (user: User): boolean => {
  // Check if lastSeen exists and is a number
  if (!user.lastSeen || typeof user.lastSeen !== 'number') {
    return false
  }

  // User is online if lastSeen was within the threshold
  const now = Date.now()
  const timeSinceLastSeen = now - user.lastSeen

  return timeSinceLastSeen < ONLINE_THRESHOLD_MS
}
