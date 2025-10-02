/**
 * Tests for presence utility functions
 * Test Firebase Rules behavior with presence logic
 */

const {
  isUserOnline,
  getLastSeenTime,
  isRecentlyActive,
  sortUsersByActivity,
  filterRecentlyActiveUsers,
  getOfflineTimeString,
  getOnlineStatusIndicator
} = require('../src/lib/presence-utils')

// Mock Firebase timestamp objects
const createFirebaseTimestamp = () => ({ '.sv': 'timestamp' })
const createMockUser = (id, overrides = {}) => ({
  id,
  name: `User${id}`,
  color: '#ff0000',
  onlineAt: null,
  lastSeen: undefined,
  isTyping: false,
  editingTodoId: null,
  ...overrides
})

describe('Presence Utils', () => {
  let mockNow

  beforeAll(() => {
    // Mock Date.now to return consistent timestamps
    mockNow = 1000000000000 // Fixed timestamp
    jest.spyOn(Date, 'now').mockReturnValue(mockNow)
  })

  afterAll(() => {
    Date.now.mockRestore()
  })

  describe('isUserOnline', () => {
    test('should return true for user with Firebase timestamp onlineAt', () => {
      const user = createMockUser('1', {
        onlineAt: createFirebaseTimestamp()
      })

      expect(isUserOnline(user)).toBe(true)
    })

    test('should return false for user with null onlineAt', () => {
      const user = createMockUser('1', {
        onlineAt: null
      })

      expect(isUserOnline(user)).toBe(false)
    })

    test('should return false for user with number onlineAt', () => {
      const user = createMockUser('1', {
        onlineAt: mockNow
      })

      expect(isUserOnline(user)).toBe(false)
    })

    test('should return false for user with undefined onlineAt', () => {
      const user = createMockUser('1', {
        onlineAt: undefined
      })

      expect(isUserOnline(user)).toBe(false)
    })
  })

  describe('getLastSeenTime', () => {
    test('should return lastSeen if it is a number', () => {
      const user = createMockUser('1', {
        lastSeen: 123456789,
        onlineAt: null
      })

      expect(getLastSeenTime(user)).toBe(123456789)
    })

    test('should fallback to onlineAt if lastSeen is not a number', () => {
      const user = createMockUser('1', {
        lastSeen: undefined, // lastSeen is not a number
        onlineAt: 987654321  // fallback to this number
      })

      expect(getLastSeenTime(user)).toBe(987654321)
    })

    test('should return 0 if neither lastSeen nor onlineAt are numbers', () => {
      const user = createMockUser('1', {
        lastSeen: createFirebaseTimestamp(),
        onlineAt: createFirebaseTimestamp()
      })

      expect(getLastSeenTime(user)).toBe(0)
    })

    test('should handle undefined lastSeen', () => {
      const user = createMockUser('1', {
        lastSeen: undefined,
        onlineAt: 555555555
      })

      expect(getLastSeenTime(user)).toBe(555555555)
    })
  })

  describe('isRecentlyActive', () => {
    test('should return true for online user regardless of time', () => {
      const user = createMockUser('1', {
        onlineAt: createFirebaseTimestamp(),
        lastSeen: mockNow - 10 * 60 * 1000 // 10 minutes ago
      })

      expect(isRecentlyActive(user, 2)).toBe(true)
    })

    test('should return true for user active within threshold', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 1 * 60 * 1000 // 1 minute ago
      })

      expect(isRecentlyActive(user, 2)).toBe(true)
    })

    test('should return false for user active beyond threshold', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 5 * 60 * 1000 // 5 minutes ago
      })

      expect(isRecentlyActive(user, 2)).toBe(false)
    })

    test('should use default 2 minutes threshold', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 1.5 * 60 * 1000 // 1.5 minutes ago
      })

      expect(isRecentlyActive(user)).toBe(true)
    })

    test('should handle custom threshold', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 30 * 60 * 1000 // 30 minutes ago
      })

      expect(isRecentlyActive(user, 60)).toBe(true) // 60 minute threshold
      expect(isRecentlyActive(user, 10)).toBe(false) // 10 minute threshold
    })
  })

  describe('sortUsersByActivity', () => {
    test('should put current user first', () => {
      const users = [
        createMockUser('1', { onlineAt: createFirebaseTimestamp() }),
        createMockUser('2', { onlineAt: createFirebaseTimestamp() }),
        createMockUser('3', { onlineAt: null })
      ]

      const sorted = sortUsersByActivity(users, '3')
      expect(sorted[0].id).toBe('3')
    })

    test('should sort online users before offline users', () => {
      const users = [
        createMockUser('1', { onlineAt: null, lastSeen: mockNow - 1000 }),
        createMockUser('2', { onlineAt: createFirebaseTimestamp() }),
        createMockUser('3', { onlineAt: null, lastSeen: mockNow - 2000 })
      ]

      const sorted = sortUsersByActivity(users)
      expect(sorted[0].id).toBe('2') // Online user first
    })

    test('should sort by last seen time within same online status', () => {
      const users = [
        createMockUser('1', { onlineAt: null, lastSeen: mockNow - 2000 }),
        createMockUser('2', { onlineAt: null, lastSeen: mockNow - 1000 }),
        createMockUser('3', { onlineAt: null, lastSeen: mockNow - 3000 })
      ]

      const sorted = sortUsersByActivity(users)
      expect(sorted.map(u => u.id)).toEqual(['2', '1', '3']) // Most recent first
    })

    test('should not mutate original array', () => {
      const users = [
        createMockUser('1'),
        createMockUser('2')
      ]
      const originalOrder = users.map(u => u.id)

      sortUsersByActivity(users)
      expect(users.map(u => u.id)).toEqual(originalOrder)
    })
  })

  describe('filterRecentlyActiveUsers', () => {
    test('should filter users by activity threshold', () => {
      const users = [
        createMockUser('1', { onlineAt: createFirebaseTimestamp() }), // Online
        createMockUser('2', { onlineAt: null, lastSeen: mockNow - 1 * 60 * 1000 }), // 1 min ago
        createMockUser('3', { onlineAt: null, lastSeen: mockNow - 5 * 60 * 1000 })  // 5 min ago
      ]

      const filtered = filterRecentlyActiveUsers(users, 2) // 2 minute threshold
      expect(filtered.map(u => u.id)).toEqual(['1', '2'])
    })

    test('should handle custom threshold', () => {
      const users = [
        createMockUser('1', { onlineAt: null, lastSeen: mockNow - 10 * 60 * 1000 }), // 10 min ago
        createMockUser('2', { onlineAt: null, lastSeen: mockNow - 30 * 60 * 1000 })  // 30 min ago
      ]

      const filtered = filterRecentlyActiveUsers(users, 15) // 15 minute threshold
      expect(filtered.map(u => u.id)).toEqual(['1'])
    })
  })

  describe('getOfflineTimeString', () => {
    test('should return online indicator for online user', () => {
      const user = createMockUser('1', {
        onlineAt: createFirebaseTimestamp()
      })

      expect(getOfflineTimeString(user)).toBe('🟢 Online')
    })

    test('should return "gerade offline" for recently offline user', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 30000 // 30 seconds ago
      })

      expect(getOfflineTimeString(user)).toBe('⚫ Gerade offline')
    })

    test('should return minutes for user offline < 1 hour', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 5 * 60 * 1000 // 5 minutes ago
      })

      expect(getOfflineTimeString(user)).toBe('🕐 vor 5 Minuten')
    })

    test('should return singular minute', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 1 * 60 * 1000 // 1 minute ago
      })

      expect(getOfflineTimeString(user)).toBe('🕐 vor 1 Minute')
    })

    test('should return hours for user offline < 1 day', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 3 * 60 * 60 * 1000 // 3 hours ago
      })

      expect(getOfflineTimeString(user)).toBe('🕐 vor 3 Stunden')
    })

    test('should return days for user offline >= 1 day', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 2 * 24 * 60 * 60 * 1000 // 2 days ago
      })

      expect(getOfflineTimeString(user)).toBe('📅 vor 2 Tagen')
    })
  })

  describe('getOnlineStatusIndicator', () => {
    test('should return green indicator for online user', () => {
      const user = createMockUser('1', {
        onlineAt: createFirebaseTimestamp()
      })

      const status = getOnlineStatusIndicator(user)
      expect(status).toEqual({
        indicator: '🟢',
        text: 'Online',
        className: 'text-green-600'
      })
    })

    test('should return yellow indicator for recently active user', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 1 * 60 * 1000 // 1 minute ago
      })

      const status = getOnlineStatusIndicator(user)
      expect(status).toEqual({
        indicator: '🟡',
        text: 'Kürzlich aktiv',
        className: 'text-yellow-600'
      })
    })

    test('should return gray indicator for offline user', () => {
      const user = createMockUser('1', {
        onlineAt: null,
        lastSeen: mockNow - 10 * 60 * 1000 // 10 minutes ago
      })

      const status = getOnlineStatusIndicator(user)
      expect(status).toEqual({
        indicator: '⚫',
        text: 'Offline',
        className: 'text-gray-400'
      })
    })
  })
})