/**
 * Tests for presence utility functions V2
 * TDD approach - only using lastSeen
 */

const { isUserOnline, isInactive, isOffline, getOnlineStatus } = require('../src/lib/presence-utils')

describe('isUserOnline', () => {
  test('should return true for user who was active in the last 1 minutes', () => {
    const now = Date.now()
    const user = {
      id: '1',
      name: 'TestUser',
      color: '#ff0000',
      lastSeen: now - 30 * 1000, // half a minute ago
      isTyping: false,
      editingTodoId: null
    }

    expect(isUserOnline(user)).toBe(true)
  })

  test('should return false for user who was active more than 2 minutes ago', () => {
    const now = Date.now()
    const user = {
      id: '2',
      name: 'TestUser2',
      color: '#00ff00',
      lastSeen: now - 5 * 60 * 1000, // 5 minutes ago
      isTyping: false,
      editingTodoId: null
    }

    expect(isUserOnline(user)).toBe(false)
  })

  test('should return false for user inactive between 2 and 5 minutes', () => {
    const now = Date.now()
    const user = {
      id: '3',
      name: 'TestUser3',
      color: '#0000ff',
      lastSeen: now - 3 * 60 * 1000, // 3 minutes ago
      isTyping: false,
      editingTodoId: null
    }

    expect(isUserOnline(user)).toBe(false)
  })
})

describe('isInactive', () => {
  test('should return false for user who was active in the last 2 minutes', () => {
    const now = Date.now()
    const user = {
      id: '1',
      name: 'TestUser',
      color: '#ff0000',
      lastSeen: now - 30 * 1000, // 1 minute ago
      isTyping: false,
      editingTodoId: null
    }

    expect(isInactive(user)).toBe(false)
  })

  test('should return true for user inactive between 2 and 5 minutes', () => {
    const now = Date.now()
    const user = {
      id: '2',
      name: 'TestUser2',
      color: '#00ff00',
      lastSeen: now - 3 * 60 * 1000, // 3 minutes ago
      isTyping: false,
      editingTodoId: null
    }

    expect(isInactive(user)).toBe(true)
  })
})

describe('isOffline', () => {
  test('should return false for user who was active in the last 2 minutes', () => {
    const now = Date.now()
    const user = {
      id: '1',
      name: 'TestUser',
      color: '#ff0000',
      lastSeen: now - 60 * 1000, // 1 minute ago
      isTyping: false,
      editingTodoId: null
    }

    expect(isOffline(user)).toBe(false)
  })

  test('should return false for user inactive between 2 and 5 minutes', () => {
    const now = Date.now()
    const user = {
      id: '2',
      name: 'TestUser2',
      color: '#00ff00',
      lastSeen: now - 3 * 60 * 1000, // 3 minutes ago
      isTyping: false,
      editingTodoId: null
    }

    expect(isOffline(user)).toBe(false)
  })

  test('should return true for user inactive more than 5 minutes', () => {
    const now = Date.now()
    const user = {
      id: '3',
      name: 'TestUser3',
      color: '#0000ff',
      lastSeen: now - 6 * 60 * 1000, // 6 minutes ago
      isTyping: false,
      editingTodoId: null
    }

    expect(isOffline(user)).toBe(true)
  })
})

describe('getOnlineStatus', () => {
  test('should return online status for user active within 1 minutes', () => {
    const now = Date.now()
    const user = {
      id: '1',
      name: 'TestUser',
      color: '#ff0000',
      lastSeen: now - 30 * 1000, // half a minute ago
      isTyping: false,
      editingTodoId: null
    }

    const status = getOnlineStatus(user)

    expect(status.state).toBe('online')
    expect(status.icon).toBe('🟢')
    expect(status.color).toBe('green')
    expect(status.text).toBe('Online')
    expect(status.lastSeenText).toBe('gerade eben')
  })

  test('should return inactive status for user between 2 and 5 minutes', () => {
    const now = Date.now()
    const user = {
      id: '2',
      name: 'TestUser2',
      color: '#00ff00',
      lastSeen: now - 3 * 60 * 1000, // 3 minutes ago
      isTyping: false,
      editingTodoId: null
    }

    const status = getOnlineStatus(user)

    expect(status.state).toBe('inactive')
    expect(status.icon).toBe('🟡')
    expect(status.color).toBe('yellow')
    expect(status.text).toBe('Inaktiv')
    expect(status.lastSeenText).toBe('vor 3 Minuten')
  })

  test('should return offline status for user inactive more than 5 minutes', () => {
    const now = Date.now()
    const user = {
      id: '3',
      name: 'TestUser3',
      color: '#0000ff',
      lastSeen: now - 10 * 60 * 1000, // 10 minutes ago
      isTyping: false,
      editingTodoId: null
    }

    const status = getOnlineStatus(user)

    expect(status.state).toBe('offline')
    expect(status.icon).toBe('⚫')
    expect(status.color).toBe('gray')
    expect(status.text).toBe('Offline')
    expect(status.lastSeenText).toBe('vor 10 Minuten')
  })
})
