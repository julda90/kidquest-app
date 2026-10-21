# KidQuest – katalog úkolů a odměn + správa odměn pro rodiče (fáze 8)

Navazuje na `docs/points-system-spec.md` (TaskKind, tier odměn, nákup odměn) a `docs/kid-tabs-spec.md` (vedlejší questy, ikony odměn).

Obsah:
1. Katalog úkolů a odměn: výchozí sada pro rodinu, kterou rodič naimportuje jedním klikem.
2. Přecenění stávajících odměn na novou ekonomiku.
3. Nová obrazovka rodiče **Odměny** (místo sekce Rewards v `Settings.jsx`).

Pracuj po krocích. Po každém kroku musí projít `./mvnw test` a `npm run build` ve `frontend/`. Všechny texty v UI česky.

---

## 1. Katalog

### 1.1 Princip
- Katalog je **statická definice v backendu** (`src/main/resources/catalog/tasks.json` a `catalog/rewards.json`), ne data v DB. Je pro všechny rodiny stejný.
- Rodič v UI vybere položky a naimportuje je. Import vytvoří běžné záznamy `task` / `reward` v jeho rodině, které pak může libovolně upravit.
- Import je idempotentní: položka se stejným `catalogKey` už v rodině existuje → přeskočit (sloupec `catalog_key VARCHAR(50)` na `task` i `reward`, nullable, unique `(family_id, catalog_key)` kde není NULL).

### 1.2 Endpointy
| metoda | cesta | role | popis |
|---|---|---|---|
| GET | `/api/catalog/tasks` | PARENT | seznam položek katalogu úkolů + příznak `alreadyImported` pro rodinu přihlášeného |
| GET | `/api/catalog/rewards` | PARENT | totéž pro odměny |
| POST | `/api/families/{familyId}/catalog/import` | PARENT | body `{ taskKeys: [], rewardKeys: [], assignments: { "<catalogKey>": "<childId>" } }`, vrací počty vytvořených a přeskočených |

`assignments` slouží pro položky s `audience: "YOUNG"`, které se mají navázat na konkrétní mladší dítě (`reward.child_id`), a pro jednorázové úkoly, které se rovnou přiřadí dítěti.

### 1.3 Katalog úkolů (`catalog/tasks.json`)

Pole: `catalogKey`, `title`, `kind`, `points`, `bonusValue`, `openQuest`, `dailyLimit`, `audience` (`ALL` = 6+ let, `YOUNG` = do 6 let).

**Pro děti 6+ (Samuel, Sára)**
| catalogKey | title | kind | body | bonus | quest | limit/den |
|---|---|---|---|---|---|---|
| `table` | Prostřít stůl | TABLE | 10 | – | ano | 3 |
| `clear_table` | Sklidit ze stolu | TABLE | 10 | – | ano | 3 |
| `laundry` | Složit prádlo | LAUNDRY | 15 | – | ano | 2 |
| `laundry_sort` | Roztřídit prádlo do skříně | LAUNDRY | 10 | – | ano | 1 |
| `room` | Uklidit pokoj | ROOM | 20 | – | ne | – |
| `bed` | Ustlat postel | ROOM | 5 | – | ne | – |
| `homework` | Domácí úkol | HOMEWORK | 20 | 15 | ne | – |
| `reading` | Číst 15 minut | HOMEWORK | 15 | – | ano | 1 |
| `wood` | Nosit dřevo (koš / kolečko) | WOOD | 30 | – | ano | 3 |
| `kindling` | Štípat třísky (přepravka) | KINDLING | 40 | – | ano | 2 |
| `stack_wood` | Srovnat dřevo do hráně | WOOD | 30 | – | ano | 1 |
| `animals` | Nakrmit zvířata | BIG_OTHER | 20 | – | ano | 2 |
| `cooking` | Pomoct s vařením | BIG_OTHER | 30 | – | ano | 1 |
| `garden` | Pomoct na zahradě (30 min) | BIG_OTHER | 30 | – | ano | 1 |
| `dishwasher` | Vyndat myčku | OTHER | 15 | – | ano | 1 |
| `trash` | Vynést koš / tříděný odpad | OTHER | 10 | – | ano | 1 |

`description` u `kindling`: „Jen s dospělým u toho. Rukavice a brýle.“ (zobrazit i dítěti na kartě úkolu).

**Pro děti do 6 let (Rebeka)**
| catalogKey | title | kind | body | quest | limit/den |
|---|---|---|---|---|---|
| `y_toys` | Uklidit hračky | ROOM | 15 | ano | 2 |
| `y_table` | Pomoct prostřít (příbory, ubrousky) | TABLE | 10 | ano | 2 |
| `y_socks` | Spárovat ponožky | LAUNDRY | 10 | ano | 1 |
| `y_kindling_basket` | Nosit třísky v košíku | WOOD | 10 | ano | 2 |
| `y_animals` | Pomoct nakrmit zvířata | BIG_OTHER | 10 | ano | 1 |
| `y_dress` | Obléct se sama | OTHER | 10 | ne | – |
| `y_plants` | Zalít kytičku | OTHER | 5 | ano | 1 |

### 1.4 Katalog odměn (`catalog/rewards.json`)

Pole: `catalogKey`, `name`, `description`, `icon`, `tier`, `pointCost`, `audience`.

Do katalogu patří i odměny, které nic nestojí: **čas s rodičem a výsady**. Pro děti bývají nejsilnější.

**Pro děti 6+**
| catalogKey | název | ikona | tier | cena |
|---|---|---|---|---|
| `r_treat` | Dobrůtka z obchodu | 🍫 | SMALL | 100 |
| `r_icecream` | Zmrzlina | 🍦 | SMALL | 120 |
| `r_screen30` | 30 min hraní / tabletu navíc | 🎮 | SMALL | 120 |
| `r_dessert` | Vybrat dezert k večeři | 🍰 | SMALL | 150 |
| `r_dinner_pick` | Vybrat večeři pro celou rodinu | 🍕 | MEDIUM | 400 |
| `r_movie` | Filmový večer s popcornem | 🎬 | MEDIUM | 450 |
| `r_late_bed` | Večerka o 30 min později | 🌙 | MEDIUM | 400 |
| `r_dad_workshop` | Odpoledne s tátou v dílně | 🔨 | MEDIUM | 500 |
| `r_campfire` | Táborák s buřty | 🔥 | MEDIUM | 600 |
| `r_climbing` | Odpoledne na lezecké stěně | 🧗 | MEDIUM | 600 |
| `r_jumppark` | Hodina v jumpparku | 🤸 | BIG | 1 500 |
| `r_puzzle` | Puzzle / stolní hra | 🧩 | BIG | 1 500 |
| `r_book` | Nová kniha | 📚 | BIG | 1 500 |
| `r_bowling` | Bowling | 🎳 | BIG | 1 500 |
| `r_lego` | LEGO stavebnice | 🧱 | BIG | 2 500 |
| `r_trip` | Výlet podle mého výběru | 🚂 | MEGA | 4 000 |
| `r_sleepover` | Přespání venku ve stanu | ⛺ | MEGA | 4 000 |

**Pro děti do 6 let** (import s `assignments` → `reward.child_id`)
| catalogKey | název | ikona | tier | cena |
|---|---|---|---|---|
| `y_sticker` | Samolepka | ⭐ | SMALL | 30 |
| `y_lollipop` | Lízátko | 🍭 | SMALL | 40 |
| `y_story` | Pohádka navíc před spaním | 📖 | SMALL | 50 |
| `y_carousel` | Kolotoč | 🎠 | MEDIUM | 100 |
| `y_crayons` | Pastelky | 🖍️ | MEDIUM | 150 |
| `y_baking` | Péct s mámou | 🧁 | MEDIUM | 150 |
| `y_plush` | Plyšák | 🧸 | BIG | 300 |

---

## 2. Přecenění stávajících odměn

Stávající odměny vznikly v době, kdy se body přidávaly ručně po 1–15. S novými úkoly (10–40 bodů) by byly zadarmo.

- Žádná migrace ani automatický přepočet. Rodič přecení ručně v nové obrazovce Odměny (kapitola 3), kde vidí, kolik dní práce cena znamená.
- Obrazovka po prvním otevření ukáže jednorázový banner (stav v `localStorage`, klíč `kq.repriceBannerDismissed`):
  „Ceny odměn jsou z doby před novým bodováním. Doporučujeme je zvýšit asi 5×. [Přecenit všechny ×5] [Upravím ručně]“
  - „Přecenit všechny ×5“ zavolá `PUT /api/rewards/{id}` pro každou aktivní odměnu bez `child_id`, se zaokrouhlením na desítky. Před provedením potvrzení přímo v banneru se seznamem „Dobrůtka 25 → 120“ atd. Nepoužívat `window.confirm`.
- **Zůstatky dětí se nemění.** Body nasbírané podle starých pravidel zůstanou jako náskok.
- Doporučené mapování pro současné odměny (zobrazit jako předvyplněný návrh v potvrzení):

| odměna | teď | návrh |
|---|---|---|
| Dobrůtka | 25 | 120 |
| Zmrzka | 50 | 150 |
| Stěna | 100 | 600 |
| Jumppark | 200 | 1 500 |
| Puzzle | 500 | 1 500 |

Pravidlo ×5 dává pro Jumppark 1 000 a pro Stěnu 500. V potvrzení proto zobraz návrh z tabulky, kde existuje `catalogKey` se shodným názvem (fuzzy: `name.toLowerCase().includes`), jinak ×5.

---

## 3. Obrazovka rodiče „Odměny“

### 3.1 Umístění
- Nová route `/rewards` v rodičovské části a položka „🎁 Odměny“ v `Sidebar.jsx` (mezi Úkoly a Děti).
- Sekci „Rewards“ ze `Settings.jsx` odstraň. V Nastavení nech jen odkaz „Správa odměn je teď v sekci Odměny →“.

### 3.2 Horní lišta
- Nadpis „Odměny“.
- **Filtr dětí** (chipy s avatary): „Všechny“ / jednotlivé dítě. Při výběru dítěte se zobrazí jen odměny pro všechny + odměny s jeho `child_id`, a ceny se přepočítají na „dny práce“ právě pro něj.
- Přepínač „Zobrazit archivované“.
- Tlačítka **„+ Nová odměna“** a **„📦 Přidat z katalogu“**.

### 3.3 Seznam
- Seskupení podle tieru se záhlavím: **Malé (1–2 dny)**, **Střední (asi týden)**, **Velké (asi měsíc)**, **Mega (2–3 měsíce)**. Uvnitř řadit podle ceny.
- Řádek odměny (na tabletu karta, na šířku 2–3 sloupce):
  - ikona (klik → výběr emoji), název, popis (zkrácený na 1 řádek)
  - cena s **inline úpravou**: klik na číslo → input, Enter uloží, Esc zruší; vedle tlačítka −10 / +10
  - pod cenou šedě **„≈ 3 dny práce“** = `ceil(pointCost / avgDaily)`, kde `avgDaily` je průměr denních bodů (`TASK` + `BONUS`) vybraného dítěte za posledních 14 dní; pro „Všechny“ průměr přes děti 6+. Při `avgDaily < 5` zobraz „málo dat“.
  - **varování**, když cena nesedí na tier: SMALL > 200, MEDIUM < 300 nebo > 900, BIG < 1 000, MEGA < 3 000 → oranžový štítek „Cena neodpovídá kategorii“. Pro odměny s `child_id` mladšího dítěte se kontrola nepoužije.
  - štítek „Jen pro Rebeku“ s avatarem, pokud má `child_id`
  - počet nákupů celkem a poslední nákup („koupeno 4×, naposledy 12. 10.“), z `reward_redemption` se stavem `APPROVED` nebo `DELIVERED`
  - akce: ✏️ Upravit, ⧉ Duplikovat, 👁 Skrýt / Zobrazit (`active`), 🗄 Archivovat / 🗑 Smazat
- Prázdný stav: „Zatím žádné odměny. Začněte katalogem, má 24 odměn připravených pro různé věky.“ + tlačítko „📦 Přidat z katalogu“.

### 3.4 Smazání vs. archivace
- Odměna, která má jakýkoli záznam v `reward_redemption`, **nejde smazat**, jen archivovat (jinak by se rozbila historie). Backend: `DELETE /api/rewards/{id}` vrátí 409 s hláškou „Odměnu už někdo koupil, můžete ji jen archivovat.“
- Nová migrace: `reward.archived_at TIMESTAMP`. Archivovaná odměna se dětem nezobrazuje a v seznamu rodiče je jen při zapnutém přepínači. `GET /api/rewards/family/{id}?includeArchived=false` (výchozí).
- Akce „Archivovat“ / „Obnovit“: `POST /api/rewards/{id}/archive`, `POST /api/rewards/{id}/restore`.
- Smazání bez nákupů: potvrzení přímo v kartě („Smazat Zmrzku? Ano / Ne“).

### 3.5 Formulář odměny (`RewardForm.jsx`, přepsat)
Modal, pole:
| pole | typ | poznámka |
|---|---|---|
| Ikona | mřížka ~24 emoji + vlastní emoji (input s max 2 znaky) | výchozí 🎁 |
| Název * | text, max 60 | |
| Popis | textarea, max 200 | zobrazí se dítěti na kartě |
| Kategorie * | 4 segmentové přepínače Malá / Střední / Velká / Mega | při změně předvyplní cenu na střed rozsahu, pokud uživatel cenu ještě neměnil |
| Cena * | číslo ≥ 1 | pod polem živě „≈ N dní práce pro Samuela / Sáru“ (každé dítě 6+ zvlášť) a nápověda k rozsahu kategorie |
| Pro koho | „Všechny děti“ / konkrétní dítě | ukládá `childId` |
| Aktivní | checkbox „Viditelná pro děti“ | |

Validace česky („Název je povinný.“, „Cena musí být aspoň 1.“). Výběr rodiny ve formuláři odstraň, rodina se bere z přihlášeného rodiče.

Náhled vpravo (na šířku) nebo dole: jak bude karta vypadat v dětském Obchodě v tématu vybraného dítěte.

### 3.6 Dialog „Přidat z katalogu“
- Dvě záložky: **Odměny** a **Úkoly** (tentýž dialog se otevírá i z obrazovky Úkoly, kde je výchozí záložka Úkoly).
- Seznam seskupený podle tieru (odměny) nebo skupiny DUTY / SCHOOL / BIG / OTHER (úkoly), s přepínačem „6+ let“ / „do 6 let“.
- Každá položka: checkbox, ikona, název, cena / body, u úkolů štítek „Vedlejší quest“.
- Už naimportované: zašedlé, „✓ už máte“, nejdou zaškrtnout.
- U položek `audience: YOUNG` se při zaškrtnutí objeví select „Pro koho“ s dětmi mladšími 6 let (předvybrané, je-li jen jedno).
- Ceny a body jdou před importem upravit přímo v řádku.
- Tlačítka „Vybrat vše v kategorii“, dole „Přidat vybrané (12)“ → `POST /catalog/import` → toast „Přidáno 12, přeskočeno 2“.

### 3.7 API (frontend)
`api/rewards.js` doplnit: `archiveReward`, `restoreReward`, `getRewards(familyId, { includeArchived })`, `getRewardStats(familyId)`.
Nový `api/catalog.js`: `getTaskCatalog`, `getRewardCatalog`, `importCatalog(familyId, payload)`.

Backend pro statistiky: `GET /api/rewards/family/{familyId}/stats` → `[{ rewardId, purchases, lastPurchasedAt }]` a `GET /api/children/family/{familyId}/earning-rate?days=14` → `[{ childId, avgDaily }]`.

### 3.8 Backend – shrnutí změn
- Migrace (další volné číslo): `task.catalog_key`, `reward.catalog_key`, `reward.archived_at` + partial unique indexy `(family_id, catalog_key) WHERE catalog_key IS NOT NULL`.
- `RewardRequest` + `icon`, `tier`, `childId`. `RewardResponse` + `icon`, `tier`, `childId`, `archivedAt`, `catalogKey`.
- `RewardService.delete` → 409, pokud existuje redemption. `findByFamilyId` filtruje `archived_at IS NULL`, není-li `includeArchived`.
- `CatalogService` načte JSON z classpath při startu (`@PostConstruct`, Jackson), validuje unikátnost `catalogKey`.
- Dětský Obchod (`/kid/shop`) ignoruje archivované a neaktivní odměny a odměny s cizím `child_id`.
- Ověřit, že rodič může měnit jen odměny své rodiny.

---

## 4. Testy
- `CatalogServiceTest`: načtení JSON, unikátní klíče, všechny `kind` / `tier` jsou platné enumy.
- `CatalogImportTest`: import 3 položek → 3 záznamy; druhý import téhož → 0 vytvořeno, 3 přeskočeno; `YOUNG` odměna s `assignments` má `child_id`.
- `RewardServiceTest`: smazání odměny s nákupem → 409; archivace ji skryje z výchozího seznamu; obnovení vrátí.

## 5. Pořadí práce
1. Migrace + DTO + archivace a ochrana mazání.
2. Katalog (JSON, service, endpointy, import).
3. Obrazovka Odměny: seznam, inline cena, dny práce, varování tieru.
4. Nový formulář odměny s náhledem.
5. Dialog katalogu (odměny i úkoly), napojený i z obrazovky Úkoly.
6. Banner přecenění.
7. Odstranění sekce Rewards ze `Settings.jsx`.

## 6. Hotovo, když
- [ ] Rodič naimportuje katalog jedním dialogem a opakovaný import nic nezduplikuje.
- [ ] Úkol Štípat třísky má v popisu bezpečnostní poznámku viditelnou dítěti.
- [ ] U každé odměny je vidět, kolik dní práce stojí pro konkrétní dítě.
- [ ] Cenu jde změnit přímo v seznamu bez otevření formuláře.
- [ ] Koupenou odměnu nejde smazat, jen archivovat, a historie nákupů zůstane.
- [ ] Odměny pro Rebeku se Samuelovi ani Sáře v Obchodě nezobrazují.
- [ ] Stávající odměny jde přecenit jedním potvrzením, zůstatky dětí se nezmění.
- [ ] `./mvnw test` a `npm run build` projdou.
