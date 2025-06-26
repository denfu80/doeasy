const ADJEKTIVE = [
  "Schneller", "Lustiger", "Grüner", "Heller", "Kalter", "Warmer", "Großer", "Kleiner",
  "Roter", "Blauer", "Gelber", "Weiser", "Smarter", "Starker", "Leiser", "Wilder",
  "Ruhiger", "Glücklicher", "Geheimer", "Magischer", "Goldener", "Silberner"
]

const SUBSTANTIVE = [
  "Hase", "Igel", "Fuchs", "Panda", "Tiger", "Löwe", "Adler", "Falke", "Wal", "Komet",
  "Stern", "Mond", "Fluss", "Berg", "Geist", "Roboter", "Ninja", "Pirat", "Zauberer",
  "Drache", "Phönix", "Ritter"
]

export const generateFunnyName = (): string => {
  const adj = ADJEKTIVE[Math.floor(Math.random() * ADJEKTIVE.length)]
  const sub = SUBSTANTIVE[Math.floor(Math.random() * SUBSTANTIVE.length)]
  return `${adj}${sub}`
}

// Helper to generate a random color for user avatars
const hashCode = (str: string): number => 
  str.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)

const intToHex = (num: number): string => 
  num.toString(16).padStart(6, "0").substring(0, 6)

export const generateColor = (str: string): string => 
  `#${intToHex(hashCode(str))}`