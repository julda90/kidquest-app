export const LEVEL_NAMES = {
  elsa: [
    'Sněhová vločka', 'Ledový krystal', 'Zimní víla', 'Ledová princezna',
    'Strážkyně severu', 'Paní ledového hradu', 'Mistryně sněhu', 'Ledový drak',
    'Polární záře', 'Věčná zima', 'Hvězdný led', 'Ledová královna',
  ],
  unicorn: [
    'Hvězdička', 'Duhová jiskra', 'Pastelová perlička', 'Malý jednorožec',
    'Duhový jednorožec', 'Křídlatý jednorožec', 'Stříbrný roh', 'Kouzelný jednorožec',
    'Zlatý jednorožec', 'Hvězdný jednorožec', 'Duhový drak', 'Královna duhy',
  ],
  hotwheels: [
    'Chodec', 'Kolo', 'Skútr', 'Závodní kolo',
    'Motorkář', 'Závodní auto', 'Dragster', 'Turbo závodník',
    'Supersport', 'Formule', 'Hypercar', 'Šampion okruhu',
  ],
  minecraft: [
    'Dřevěný meč', 'Kamenný meč', 'Zlatý meč', 'Železný meč',
    'Diamantový meč', 'Netheritový meč', 'Průzkumník', 'Hrdina Netheru',
    'Ender bojovník', 'Drakobijce', 'Strážce konců', 'Netheritový král',
  ],
}

export const DEFAULT_LEVEL_NAMES = [
  'Nováček', 'Učedník', 'Pomocník', 'Šikovný',
  'Zkušený', 'Zručný', 'Pokročilý', 'Expertní',
  'Mistr', 'Velmistr', 'Legenda', 'Hrdina',
]

export const STANDARD_THRESHOLDS = [0, 150, 400, 800, 1400, 2200, 3300, 4800, 7000, 10000, 13500, 18000]
export const YOUNG_THRESHOLDS    = [0,  75, 200, 400,  700, 1100, 1650, 2400, 3500,  5000,  6750,  9000]

export function getLevelName(avatar, level) {
  const names = LEVEL_NAMES[avatar] ?? DEFAULT_LEVEL_NAMES
  return names[Math.min(level - 1, names.length - 1)] ?? `Úroveň ${level}`
}
