const _av = import.meta.glob('../../assets/themes/frozen/avatar/L*.webp', { eager: true, import: 'default' })
const _la = import.meta.glob('../../assets/themes/frozen/landscape/L*.webp', { eager: true, import: 'default' })
const _th = import.meta.glob('../../assets/themes/frozen/landscape/thumb/L*.webp', { eager: true, import: 'default' })

function pad(n) { return String(n).padStart(2, '0') }
const av = n => _av[`../../assets/themes/frozen/avatar/L${pad(n)}.webp`] ?? null
const la = n => _la[`../../assets/themes/frozen/landscape/L${pad(n)}.webp`] ?? null
const th = n => _th[`../../assets/themes/frozen/landscape/thumb/L${pad(n)}.webp`] ?? null

export const FROZEN_LEVELS = [
  { level: 1,  title: 'Sněhová vločka',       avatarChange: 'holčička v zimním kabátku a čepici',               landscapeChange: 'zasněžená vesnička, kouř z komínů',              avatar: av(1),  landscape: la(1),  thumb: th(1)  },
  { level: 2,  title: 'Ledový krystal',        avatarChange: 'šála s vločkami',                                  landscapeChange: 'zamrzlé jezero u vesnice',                        avatar: av(2),  landscape: la(2),  thumb: th(2)  },
  { level: 3,  title: 'Ledová princezna',      avatarChange: 'stříbrná čelenka',                                 landscapeChange: 'ledový les, třpytivé stromy',                    avatar: av(3),  landscape: la(3),  thumb: th(3)  },
  { level: 4,  title: 'Sněžná tanečnice',      avatarChange: 'třpytivé šaty, brusle',                            landscapeChange: 'kluziště na jezeře, lampiony',                   avatar: av(4),  landscape: la(4),  thumb: th(4)  },
  { level: 5,  title: 'Strážkyně severu',      avatarChange: 'dlouhý modrý plášť',                               landscapeChange: 'horský průsmyk, sněžné vrcholky',                avatar: av(5),  landscape: la(5),  thumb: th(5)  },
  { level: 6,  title: 'Přítelkyně sobíka',     avatarChange: 'mazlíček sobík, saně',                             landscapeChange: 'saně se sobíkem v zasněženém lese',              avatar: av(6),  landscape: la(6),  thumb: th(6)  },
  { level: 7,  title: 'Mistryně ledu',         avatarChange: 'ledová hůlka, vločky kolem ruky',                  landscapeChange: 'zahrada ledových soch',                          avatar: av(7),  landscape: la(7),  thumb: th(7)  },
  { level: 8,  title: 'Paní polární záře',     avatarChange: 'aura polární záře kolem postavy',                  landscapeChange: 'nebe s polární září',                            avatar: av(8),  landscape: la(8),  thumb: th(8)  },
  { level: 9,  title: 'Ledová kouzelnice',     avatarChange: 'plášť z vloček, mazlíček sněžná sova',             landscapeChange: 'ledový most přes propast',                       avatar: av(9),  landscape: la(9),  thumb: th(9)  },
  { level: 10, title: 'Paní hor',              avatarChange: 'diadém s krystalem',                               landscapeChange: 'ledový palác zvenku na vrcholu',                 avatar: av(10), landscape: la(10), thumb: th(10) },
  { level: 11, title: 'Ledová královna',       avatarChange: 'koruna, dlouhá vlečka',                            landscapeChange: 'trůnní sál paláce',                              avatar: av(11), landscape: la(11), thumb: th(11) },
  { level: 12, title: 'Legenda severu',        avatarChange: 'zářivá aura, mazlíček ledový drak',                landscapeChange: 'palác pod polární září a hvězdami',              avatar: av(12), landscape: la(12), thumb: th(12) },
]
