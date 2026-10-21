// Level names indexed 1-6 (level 1 = index 0), keyed by avatar id
export const LEVEL_NAMES = {
  elsa: [
    'Sněhulák',
    'Princezna sněhu',
    'Ledová kouzelnice',
    'Strážkyně zimy',
    'Královna ledu',
    'Elsa Mocná',
  ],
  unicorn: [
    'Hříbě',
    'Jednorožec',
    'Kouzelný jednorožec',
    'Duhový jednorožec',
    'Světelný jednorožec',
    'Jednorožec hvězd',
  ],
  hotwheels: [
    'Nováček',
    'Řemeslník',
    'Stavitel',
    'Průzkumník',
    'Dobrodružec',
    'Mistr Craft',
  ],
}

export const DEFAULT_LEVEL_NAMES = [
  'Začátečník',
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
