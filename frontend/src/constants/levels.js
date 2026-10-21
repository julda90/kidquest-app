// Level names indexed 1-6 (level 1 = index 0), keyed by avatar id
export const LEVEL_NAMES = {
  elsa: [
    'Sněhová vločka',
    'Ledový krystal',
    'Ledová princezna',
    'Strážkyně severu',
    'Mistryně ledu',
    'Ledová královna',
  ],
  unicorn: [
    'Hvězdička',
    'Duhová jiskra',
    'Malý jednorožec',
    'Duhový jednorožec',
    'Kouzelný jednorožec',
    'Královna duhy',
  ],
  hotwheels: [
    'Dřevěný',
    'Kamenný',
    'Železný',
    'Zlatý',
    'Diamantový',
    'Netheritový krumpáč',
  ],
  minecraft: [
    'Dřevěný',
    'Kamenný',
    'Železný',
    'Zlatý',
    'Diamantový',
    'Netheritový krumpáč',
  ],
}

export const DEFAULT_LEVEL_NAMES = [
  'Nováček',
  'Pomocník',
  'Šikovný',
  'Zkušený',
  'Expertní',
  'Mistr',
]

export function getLevelName(avatar, level) {
  const names = LEVEL_NAMES[avatar] ?? DEFAULT_LEVEL_NAMES
  return names[Math.min(level - 1, names.length - 1)] ?? `Úroveň ${level}`
}
