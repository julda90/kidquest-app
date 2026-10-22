export const LEVEL_NAMES = {
  elsa: [
    'Sněhová vločka', 'Ledový krystal', 'Ledová princezna', 'Sněžná tanečnice',
    'Strážkyně severu', 'Přítelkyně sobíka', 'Mistryně ledu', 'Paní polární záře',
    'Ledová kouzelnice', 'Paní hor', 'Ledová královna', 'Legenda severu',
  ],
  unicorn: [
    'Hvězdička', 'Duhová jiskra', 'Malý jednorožec', 'Třpytivá hříva',
    'Duhový jednorožec', 'Kamarádka motýlků', 'Hvězdný jednorožec', 'Obláčková tanečnice',
    'Měsíční jednorožec', 'Kouzelný jednorožec', 'Duhová princezna', 'Královna duhy',
  ],
  minecraft: [
    'Dřevěný krumpáč', 'Kamenný krumpáč', 'Železný krumpáč', 'Průzkumník',
    'Zlatý krumpáč', 'Strážce lesa', 'Diamantový krumpáč', 'Rytíř',
    'Lovec pokladů', 'Ohnivý horník', 'Pán oblaků', 'Legenda',
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
