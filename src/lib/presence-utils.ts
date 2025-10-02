/**
 * Presence Utility Functions
 * Centralized logic for user online status and last seen functionality
 */

import { User } from '@/types/todo'

/**
 * Check if a user is currently online (has active session)
 * @param user - User object to check
 * @returns true if user has active onlineAt timestamp
 */
export const isUserOnline = (user: User): boolean => {
  return !!(user.onlineAt && typeof user.onlineAt === 'object')
}

/**
 * Get the last seen timestamp for a user
 * @param user - User object
 * @returns timestamp as number, 0 if no valid timestamp found
 */
export const getLastSeenTime = (user: User): number => {
  const lastSeen = user.lastSeen || user.onlineAt
  return typeof lastSeen === 'number' ? lastSeen : 0
}

/**
 * Check if user was recently active (online or within time threshold)
 * @param user - User object to check
 * @param maxMinutes - Maximum minutes since last activity (default: 2)
 * @returns true if user is online or was active within threshold
 */
export const isRecentlyActive = (user: User, maxMinutes: number = 2): boolean => {
  // First check if user is currently online
  if (isUserOnline(user)) {
    return true
  }

  // Check if user was seen within the time threshold
  const now = Date.now()
  const lastSeenTime = getLastSeenTime(user)
  const timeSinceLastSeen = now - lastSeenTime

  return timeSinceLastSeen < maxMinutes * 60 * 1000
}

/**
 * Sort users by online status and activity
 * Online users first, then by most recent activity
 * @param users - Array of users to sort
 * @param currentUserId - Optional current user ID to always put first
 * @returns sorted array of users
 */
export const sortUsersByActivity = (users: User[], currentUserId?: string): User[] => {
  return [...users].sort((a, b) => {
    // Always put current user first
    if (currentUserId) {
      if (a.id === currentUserId) return -1
      if (b.id === currentUserId) return 1
    }

    // Sort by online status first
    const aOnline = isUserOnline(a)
    const bOnline = isUserOnline(b)

    if (aOnline && !bOnline) return -1
    if (!aOnline && bOnline) return 1

    // If both have same online status, sort by last seen time
    const aTime = getLastSeenTime(a)
    const bTime = getLastSeenTime(b)

    return bTime - aTime // Most recent first
  })
}

/**
 * Filter users by activity within time threshold
 * @param users - Array of users to filter
 * @param maxMinutes - Maximum minutes since last activity
 * @returns filtered array of users
 */
export const filterRecentlyActiveUsers = (users: User[], maxMinutes: number = 2): User[] => {
  return users.filter(user => isRecentlyActive(user, maxMinutes))
}

/**
 * Get a human readable offline time string
 * @param user - User object
 * @returns formatted string like "⚫ Gerade offline" or "🕐 vor 5 Minuten"
 */
export const getOfflineTimeString = (user: User): string => {
  // If user is online, return online indicator
  if (isUserOnline(user)) {
    return '🟢 Online'
  }

  const now = Date.now()
  const lastSeenTime = getLastSeenTime(user)
  const diff = now - lastSeenTime

  if (diff < 60000) { // < 1 minute
    return '⚫ Gerade offline'
  } else if (diff < 3600000) { // < 1 hour
    const minutes = Math.floor(diff / 60000)
    return `🕐 vor ${minutes} Minute${minutes === 1 ? '' : 'n'}`
  } else if (diff < 86400000) { // < 1 day
    const hours = Math.floor(diff / 3600000)
    return `🕐 vor ${hours} Stunde${hours === 1 ? '' : 'n'}`
  } else { // >= 1 day
    const days = Math.floor(diff / 86400000)
    return `📅 vor ${days} Tag${days === 1 ? '' : 'en'}`
  }
}

/**
 * Get online status indicator for UI
 * @param user - User object
 * @returns object with status indicator and text
 */
export const getOnlineStatusIndicator = (user: User): {
  indicator: string,
  text: string,
  className: string
} => {
  if (isUserOnline(user)) {
    return {
      indicator: '🟢',
      text: 'Online',
      className: 'text-green-600'
    }
  }

  if (isRecentlyActive(user, 2)) {
    return {
      indicator: '🟡',
      text: 'Kürzlich aktiv',
      className: 'text-yellow-600'
    }
  }

  return {
    indicator: '⚫',
    text: 'Offline',
    className: 'text-gray-400'
  }
}