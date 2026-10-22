const _av = import.meta.glob('../../assets/themes/minecraft/avatar/L*.webp', { eager: true, import: 'default' })
const _la = import.meta.glob('../../assets/themes/minecraft/landscape/L*.webp', { eager: true, import: 'default' })
const _th = import.meta.glob('../../assets/themes/minecraft/landscape/thumb/L*.webp', { eager: true, import: 'default' })

function pad(n) { return String(n).padStart(2, '0') }
const av = n => _av[`../../assets/themes/minecraft/avatar/L${pad(n)}.webp`] ?? null
const la = n => _la[`../../assets/themes/minecraft/landscape/L${pad(n)}.webp`] ?? null
const th = n => _th[`../../assets/themes/minecraft/landscape/thumb/L${pad(n)}.webp`] ?? null

export const MINECRAFT_LEVELS = [
  { level: 1,  title: 'Dřevěný krumpáč',   avatarChange: 'základní postavička, dřevěný krumpáč',          landscapeChange: 'slunná louka, pár stromů, ráno',                    avatar: av(1),  landscape: la(1),  thumb: th(1)  },
  { level: 2,  title: 'Kamenný krumpáč',    avatarChange: 'kamenný krumpáč',                               landscapeChange: 'na louce přibude malý srub',                         avatar: av(2),  landscape: la(2),  thumb: th(2)  },
  { level: 3,  title: 'Železný krumpáč',    avatarChange: 'železný krumpáč, louč za pasem',                landscapeChange: 'vchod do jeskyně s loučemi',                         avatar: av(3),  landscape: la(3),  thumb: th(3)  },
  { level: 4,  title: 'Průzkumník',         avatarChange: 'kožená helma a vesta',                          landscapeChange: 'malá vesnice s polem',                               avatar: av(4),  landscape: la(4),  thumb: th(4)  },
  { level: 5,  title: 'Zlatý krumpáč',      avatarChange: 'zlatý krumpáč',                                 landscapeChange: 'řeka a vodní mlýn u vesnice',                        avatar: av(5),  landscape: la(5),  thumb: th(5)  },
  { level: 6,  title: 'Strážce lesa',       avatarChange: 'železné brnění, mazlíček vlk',                  landscapeChange: 'hustý les za soumraku, světlušky',                   avatar: av(6),  landscape: la(6),  thumb: th(6)  },
  { level: 7,  title: 'Diamantový krumpáč', avatarChange: 'diamantový krumpáč',                            landscapeChange: 'hluboký důl se zářícími krystaly, důlní vozík',      avatar: av(7),  landscape: la(7),  thumb: th(7)  },
  { level: 8,  title: 'Rytíř',              avatarChange: 'diamantová helma a štít',                       landscapeChange: 'hrad na kopci nad vesnicí',                          avatar: av(8),  landscape: la(8),  thumb: th(8)  },
  { level: 9,  title: 'Lovec pokladů',      avatarChange: 'luk, batoh s mapou, mazlíček papoušek',         landscapeChange: 'prastarý chrám v džungli',                          avatar: av(9),  landscape: la(9),  thumb: th(9)  },
  { level: 10, title: 'Ohnivý horník',      avatarChange: 'tmavý ohnivzdorný krumpáč a brnění',            landscapeChange: 'ohnivá hlubina, lávové řeky, portál',               avatar: av(10), landscape: la(10), thumb: th(10) },
  { level: 11, title: 'Pán oblaků',         avatarChange: 'křídla na zádech',                              landscapeChange: 'létající ostrovy v oblacích',                        avatar: av(11), landscape: la(11), thumb: th(11) },
  { level: 12, title: 'Legenda',            avatarChange: 'koruna, zářivé brnění, mazlíček malý drak',     landscapeChange: 'hvězdný ostrov nad mraky, hvězdná noc',             avatar: av(12), landscape: la(12), thumb: th(12) },
]
