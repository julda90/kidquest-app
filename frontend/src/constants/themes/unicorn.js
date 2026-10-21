const _av = import.meta.glob('../../assets/themes/unicorn/avatar/L*.png', { eager: true, import: 'default' })
const _la = import.meta.glob('../../assets/themes/unicorn/landscape/L*.webp', { eager: true, import: 'default' })
const _th = import.meta.glob('../../assets/themes/unicorn/landscape/thumb/L*.webp', { eager: true, import: 'default' })

function pad(n) { return String(n).padStart(2, '0') }
const av = n => _av[`../../assets/themes/unicorn/avatar/L${pad(n)}.png`] ?? null
const la = n => _la[`../../assets/themes/unicorn/landscape/L${pad(n)}.webp`] ?? null
const th = n => _th[`../../assets/themes/unicorn/landscape/thumb/L${pad(n)}.webp`] ?? null

export const UNICORN_LEVELS = [
  { level: 1,  title: 'Hvězdička',             avatarChange: 'malé hříbátko bez rohu',                          landscapeChange: 'louka s kytičkami',                              avatar: av(1),  landscape: la(1),  thumb: th(1)  },
  { level: 2,  title: 'Duhová jiskra',          avatarChange: 'mašle v hřívě',                                   landscapeChange: 'duha na obloze',                                 avatar: av(2),  landscape: la(2),  thumb: th(2)  },
  { level: 3,  title: 'Malý jednorožec',        avatarChange: 'vyroste růžek',                                   landscapeChange: 'potůček s kamínky',                              avatar: av(3),  landscape: la(3),  thumb: th(3)  },
  { level: 4,  title: 'Třpytivá hříva',         avatarChange: 'duhová hříva',                                    landscapeChange: 'zahrádka s houbičkami',                          avatar: av(4),  landscape: la(4),  thumb: th(4)  },
  { level: 5,  title: 'Duhový jednorožec',      avatarChange: 'duhový ocásek',                                   landscapeChange: 'duhový most přes potok',                         avatar: av(5),  landscape: la(5),  thumb: th(5)  },
  { level: 6,  title: 'Kamarádka motýlků',      avatarChange: 'mazlíček motýlek',                                landscapeChange: 'motýlí louka',                                   avatar: av(6),  landscape: la(6),  thumb: th(6)  },
  { level: 7,  title: 'Hvězdný jednorožec',     avatarChange: 'hvězdička na čele',                               landscapeChange: 'večerní obloha s hvězdami',                      avatar: av(7),  landscape: la(7),  thumb: th(7)  },
  { level: 8,  title: 'Obláčková tanečnice',    avatarChange: 'malá křídla',                                     landscapeChange: 'louka mezi obláčky',                             avatar: av(8),  landscape: la(8),  thumb: th(8)  },
  { level: 9,  title: 'Měsíční jednorožec',     avatarChange: 'měsíční sedlo',                                   landscapeChange: 'velký měsíc nad obláčky',                        avatar: av(9),  landscape: la(9),  thumb: th(9)  },
  { level: 10, title: 'Kouzelný jednorožec',    avatarChange: 'velká třpytivá křídla',                           landscapeChange: 'hrad na obláčku',                                avatar: av(10), landscape: la(10), thumb: th(10) },
  { level: 11, title: 'Duhová princezna',       avatarChange: 'korunka',                                         landscapeChange: 'duhový zámek',                                   avatar: av(11), landscape: la(11), thumb: th(11) },
  { level: 12, title: 'Královna duhy',          avatarChange: 'třpytivá aura, mazlíček malý pegas',              landscapeChange: 'duhový zámek s ohňostrojem',                     avatar: av(12), landscape: la(12), thumb: th(12) },
]
