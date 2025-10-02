/**
 * Presence Configuration
 * Central configuration for presence/online status logic
 */

/**
 * Time threshold in minutes for considering a user "online"
 * Users who were active within this timeframe are shown as online
 */
export const ONLINE_THRESHOLD_MINUTES = 2

/**
 * Time threshold in milliseconds for considering a user "online"
 */
export const ONLINE_THRESHOLD_MS = ONLINE_THRESHOLD_MINUTES * 60 * 1000

/**
 * Time threshold in minutes for considering a user "offline"
 * Users who were inactive for more than this timeframe are shown as offline
 */
export const OFFLINE_THRESHOLD_MINUTES = 5

/**
 * Time threshold in milliseconds for considering a user "offline"
 */
export const OFFLINE_THRESHOLD_MS = OFFLINE_THRESHOLD_MINUTES * 60 * 1000
