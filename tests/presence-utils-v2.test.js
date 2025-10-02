/**
 * Tests for presence utility functions V2
 * TDD approach - only using lastSeen
 */

const { isUserOnline } = require('../src/lib/presence-utils-v2')

describe('isUserOnline', () => {
  test('should return true for user who was active in the last 2 minutes', () => {
    const now = Date.now()
    const user = {
      id: '1',
      name: 'TestUser',
      color: '#ff0000',
      lastSeen: now - 60 * 1000, // 1 minute ago
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
})
