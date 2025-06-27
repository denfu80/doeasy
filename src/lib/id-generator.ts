/**
 * Generates human-readable, memorable IDs for todo lists
 * Format: adjective-verb-noun (e.g., "clever-tiger-flies-to-moon")
 */

const adjectives = [
  // Colors
  'rosa', 'lila', 'blau', 'gruen', 'gelb', 'rot', 'weiss', 'schwarz',
  'golden', 'silber', 'bronze', 'orange', 'tuerkis', 'violet',
  
  // Positive adjectives
  'klug', 'schnell', 'stark', 'mutig', 'lustig', 'clever', 'wild', 'frei',
  'cool', 'super', 'mega', 'ultra', 'toll', 'nett', 'suess', 'lieb',
  'gross', 'klein', 'rund', 'eckig', 'weich', 'hart', 'warm', 'kalt',
  
  // Fun adjectives
  'flauschig', 'zauberhaft', 'magisch', 'wunderbar', 'fantastisch',
  'geheim', 'mystisch', 'cosmic', 'digital', 'virtual', 'modern',
  'retro', 'vintage', 'fresh', 'smooth', 'crispy', 'fluffy'
]

const animals = [
  // Common animals
  'tiger', 'loewe', 'baer', 'wolf', 'fuchs', 'hase', 'katze', 'hund',
  'vogel', 'adler', 'falke', 'eule', 'pinguin', 'delfin', 'wal', 'hai',
  'elefant', 'giraffe', 'zebra', 'panda', 'koala', 'kanu', 'lama',
  
  // Fun animals
  'einhorn', 'drache', 'phoenix', 'pegasus', 'greif', 'sphinx',
  'kraken', 'narwal', 'qualle', 'seepferd', 'flamingo', 'tukan',
  'otter', 'biber', 'igel', 'eichhorn', 'waschbaer', 'stinktier'
]

const verbs = [
  // Action verbs
  'fliegt', 'springt', 'rennt', 'tanzt', 'singt', 'lacht', 'spielt',
  'schwimmt', 'taucht', 'klettert', 'haepft', 'rollt', 'dreht',
  'zaubert', 'malt', 'baut', 'erschafft', 'entdeckt', 'erforscht',
  'reist', 'wandert', 'segelt', 'surfet', 'skatet', 'fährt'
]

const destinations = [
  // Places
  'zum-mond', 'zu-den-sternen', 'ins-weltall', 'zum-regenbogen',
  'zum-meer', 'zum-berg', 'in-den-wald', 'zur-insel', 'zum-schloss',
  'in-die-wolken', 'zum-horizont', 'ins-abenteuer', 'zum-schatz',
  'ins-glueck', 'zum-erfolg', 'zur-freude', 'zum-ziel', 'nach-hause',
  
  // Fun destinations
  'zur-schokolade', 'zum-kuchen', 'zur-pizza', 'zum-kaffee',
  'ins-buero', 'zum-meeting', 'zur-pause', 'zum-wochenende',
  'in-den-urlaub', 'zur-party', 'zum-konzert', 'ins-kino'
]

/**
 * Generate a unique, human-readable ID
 * @returns A memorable ID string like "clever-tiger-flies-to-moon"
 */
export function generateReadableId(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const verb = verbs[Math.floor(Math.random() * verbs.length)]
  const destination = destinations[Math.floor(Math.random() * destinations.length)]
  
  return `${adjective}-${animal}-${verb}-${destination}`
}

/**
 * Generate multiple ID candidates and return the shortest one
 * This helps avoid very long IDs while maintaining uniqueness
 */
export function generateOptimalReadableId(): string {
  const candidates = Array.from({ length: 5 }, () => generateReadableId())
  
  // Return the shortest candidate (or first if all same length)
  return candidates.reduce((shortest, current) => 
    current.length < shortest.length ? current : shortest
  )
}

/**
 * Validate if an ID follows our readable format
 * @param id The ID to validate
 * @returns true if the ID matches our expected format
 */
export function isReadableId(id: string): boolean {
  // Check if it has 4 parts separated by hyphens
  const parts = id.split('-')
  if (parts.length < 3) return false
  
  // Check if parts contain only letters (German characters allowed)
  const validCharPattern = /^[a-zA-ZäöüÄÖÜß]+$/
  return parts.every(part => validCharPattern.test(part))
}

/**
 * Generate a fallback ID if readable ID generation fails
 * Falls back to a shorter format: adjective-animal
 */
export function generateFallbackId(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adjective}-${animal}`
}