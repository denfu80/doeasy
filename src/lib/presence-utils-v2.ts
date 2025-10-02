/**
 * Presence Utility Functions V2
 * Clean TDD approach - only using lastSeen
 */

import { User } from '@/types/todo'
import { ONLINE_THRESHOLD_MS, OFFLINE_THRESHOLD_MS } from './presence-config'

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

/**
 * Check if a user is inactive
 * @param user - User object to check
 * @returns true if user is inactive (more than 2 minutes since last activity)
 */
export const isInactive = (user: User): boolean => {
  return !isUserOnline(user)
}

/**
 * Check if a user is offline
 * @param user - User object to check
 * @returns true if user is offline (more than 5 minutes since last activity)
 */
export const isOffline = (user: User): boolean => {
  // Check if lastSeen exists and is a number
  if (!user.lastSeen || typeof user.lastSeen !== 'number') {
    return true // No lastSeen = offline
  }

  // User is offline if lastSeen was more than 5 minutes ago
  const now = Date.now()
  const timeSinceLastSeen = now - user.lastSeen

  return timeSinceLastSeen >= OFFLINE_THRESHOLD_MS
}

/**
 * Get comprehensive online status for a user
 * @param user - User object to check
 * @returns Status object with state, icon, color, text, and lastSeenText
 */
export const getOnlineStatus = (user: User): {
  state: 'online' | 'inactive' | 'offline',
  icon: string,
  color: string,
  text: string,
  lastSeenText: string
} => {
  // Calculate time since last seen
  const getLastSeenText = (lastSeen: number): string => {
    const now = Date.now()
    const diff = now - lastSeen
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) {
      return 'gerade eben'
    } else if (minutes < 60) {
      return `vor ${minutes} Minute${minutes === 1 ? '' : 'n'}`
    } else if (hours < 24) {
      return `vor ${hours} Stunde${hours === 1 ? '' : 'n'}`
    } else {
      return `vor ${days} Tag${days === 1 ? '' : 'en'}`
    }
  }

  // Get last seen text if available
  const lastSeenText = (user.lastSeen && typeof user.lastSeen === 'number')
    ? getLastSeenText(user.lastSeen)
    : ''

  // Determine status based on activity
  if (isUserOnline(user)) {
    return {
      state: 'online',
      icon: '🟢',
      color: 'green',
      text: 'Online',
      lastSeenText
    }
  }

  if (isInactive(user)) {
    return {
      state: 'inactive',
      icon: '🟡',
      color: 'yellow',
      text: 'Inaktiv',
      lastSeenText
    }
  }

  // isOffline
  return {
    state: 'offline',
    icon: '⚫',
    color: 'gray',
    text: 'Offline',
    lastSeenText
  }
}
