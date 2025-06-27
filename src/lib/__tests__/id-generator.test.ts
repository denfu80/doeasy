import { generateReadableId, generateOptimalReadableId, isReadableId, generateFallbackId } from '../id-generator'

describe('ID Generator', () => {
  test('generateReadableId creates valid format', () => {
    const id = generateReadableId()
    expect(id).toMatch(/^[a-zA-ZäöüÄÖÜß]+-[a-zA-ZäöüÄÖÜß]+-[a-zA-ZäöüÄÖÜß]+-[a-zA-ZäöüÄÖÜß\-]+$/)
    expect(id.split('-').length).toBeGreaterThanOrEqual(3)
  })

  test('generateOptimalReadableId returns shortest option', () => {
    const id = generateOptimalReadableId()
    expect(id).toMatch(/^[a-zA-ZäöüÄÖÜß]+-[a-zA-ZäöüÄÖÜß]+-[a-zA-ZäöüÄÖÜß]+-[a-zA-ZäöüÄÖÜß\-]+$/)
    expect(id.length).toBeGreaterThan(5)
    expect(id.length).toBeLessThan(100)
  })

  test('isReadableId validates format correctly', () => {
    expect(isReadableId('clever-tiger-flies')).toBe(true)
    expect(isReadableId('rosa-hase-springt-zum-mond')).toBe(true)
    expect(isReadableId('ab')).toBe(false) // too short
    expect(isReadableId('invalid_format')).toBe(false) // underscore not allowed
    expect(isReadableId('123-456')).toBe(false) // only numbers
    expect(isReadableId('')).toBe(false) // empty
  })

  test('generateFallbackId creates short format', () => {
    const id = generateFallbackId()
    expect(id).toMatch(/^[a-zA-ZäöüÄÖÜß]+-[a-zA-ZäöüÄÖÜß]+$/)
    expect(id.split('-').length).toBe(2)
  })

  test('generated IDs are unique', () => {
    const ids = new Set()
    for (let i = 0; i < 50; i++) {
      const id = generateReadableId()
      expect(ids.has(id)).toBe(false)
      ids.add(id)
    }
  })
})