# KidQuest – úrovně, vývoj avatara a krajiny (katalog)

S každou úrovní se **avatar vylepší** (nový nástroj, oblečení, mazlíček, křídla…) a **krajina na pozadí poroste** (z louky se stane vesnice, důl, hrad…). Dítě tak vidí pokrok na první pohled, ne jen v čísle.

**Nahrazuje** původních 6 úrovní z `points-system-spec.md` a skiny/rámečky z `kid-tabs-spec.md` (kapitola 7). Po čistém startu (`homework-scoring-and-fresh-start.md`) začínají všichni na úrovni 1, takže změna prahů nic nerozbije.

---

## 1. Postup na další úroveň

### 1.1 Princip
- Úroveň určuje **jen XP**. XP = součet `TASK`, `BONUS`, `STREAK`, `CHEST` a nikdy neklesá. Nákup odměny úroveň neovlivní.
- **12 úrovní.** Mezery mezi prahy postupně rostou. Na začátku přijde postup rychle (motivace hned první týden), později jednou za 1–2 měsíce (dlouhodobý cíl).
- Děti mladší 6 let mají **poloviční prahy**, protože vydělávají zhruba polovinu. Tempo postupu je tak pro všechny stejné.
- Po úrovni 12 **prestiž**: každých dalších 4 000 XP (2 000 u mladších) přidá ⭐ k jménu. Konec nikdy nenastane.

### 1.2 Prahy XP
Odhad dní při tempu ~70 XP/den (děti 6+) nebo ~35 XP/den (do 6 let).

| úroveň | XP 6+ | XP do 6 let | dosaženo zhruba za |
|---|---|---|---|
| 1 | 0 | 0 | start |
| 2 | 150 | 75 | 2 dny |
| 3 | 400 | 200 | 6 dní |
| 4 | 800 | 400 | 11 dní |
| 5 | 1 400 | 700 | 3 týdny |
| 6 | 2 200 | 1 100 | 1 měsíc |
| 7 | 3 300 | 1 650 | 7 týdnů |
| 8 | 4 800 | 2 400 | 10 týdnů |
| 9 | 7 000 | 3 500 | 3,5 měsíce |
| 10 | 10 000 | 5 000 | 5 měsíců |
| 11 | 13 500 | 6 750 | 6,5 měsíce |
| 12 | 18 000 | 9 000 | 8,5 měsíce |
| ⭐ prestiž | +4 000 | +2 000 | asi každé 2 měsíce |

### 1.3 Co se při postupu stane
1. **Oslava (overlay, celá obrazovka):**
   - starý avatar se „promění“ v nový (cross-fade + záblesk v barvě tématu),
   - název nové úrovně velkým písmem,
   - karta „🔓 Odemčeno: Železný krumpáč + jeskyně“,
   - konfety podle tématu (vločky / bloky / duhové jiskry).
2. **Krajina:** po zavření overlaye se na pozadí aplikace přepne nová scéna a nový prvek krajiny se „vynoří“ (fade + posun zdola, 1,5 s).
3. **Mapa:** avatar dojde na nové stanoviště.
4. **Rodič:** v přehledu karta „🎉 Samuel postoupil na úroveň 5 · Zlatý krumpáč“. Je to dobrý moment ho pochválit i osobně.

Detekce: `ApprovalResult.levelUp` (server) a jako záloha porovnání s posledním viděným levelem v `localStorage` (`kq.lastSeenLevel.<childId>`). Oslava se ukáže dítěti při dalším otevření aplikace, ne rodiči při schvalování.

### 1.4 Šatník (záložka Já)
- Dítě si může jako **vzhled** zvolit kterýkoli odemčený stupeň avatara (někdo má radši zlatý krumpáč než diamantový).
- A zvlášť **domov**: kteroukoli odemčenou krajinu jako pozadí aplikace.
- Výchozí = nejvyšší odemčené. Zamčené stupně šedě se zámkem a „Úroveň 7“.
- Uloženo na serveru: `child.selected_avatar_level`, `child.selected_landscape_level` (NULL = vždy nejnovější).

---

## 2. Katalog podle témat

Každá úroveň má: **název** (titul dítěte), **avatar** (co se na postavě změní) a **krajinu** (scéna pozadí + co v ní přibude).

### 2.1 ⛏️ Blokový svět (minecraft) – Samuel

| L | název | avatar | krajina |
|---|---|---|---|
| 1 | Dřevěný krumpáč | základní postavička, dřevěný krumpáč | slunná louka, pár stromů, ráno |
| 2 | Kamenný krumpáč | kamenný krumpáč | na louce přibude malý srub |
| 3 | Železný krumpáč | železný krumpáč, louč za pasem | vchod do jeskyně s loučemi |
| 4 | Průzkumník | kožená helma a vesta | malá vesnice s polem |
| 5 | Zlatý krumpáč | zlatý krumpáč | řeka a **vodní mlýn** u vesnice |
| 6 | Strážce lesa | železné brnění, mazlíček **vlk** | hustý les za soumraku, světlušky |
| 7 | Diamantový krumpáč | diamantový krumpáč | hluboký důl se zářícími krystaly, důlní vozík |
| 8 | Rytíř | diamantová helma a štít | hrad na kopci nad vesnicí |
| 9 | Lovec pokladů | luk, batoh s mapou, mazlíček **papoušek** | prastarý chrám v džungli |
| 10 | Ohnivý horník | tmavý ohnivzdorný krumpáč a brnění | ohnivá hlubina, lávové řeky, portál |
| 11 | Pán oblaků | **křídla** na zádech | létající ostrovy v oblacích |
| 12 | Legenda | koruna, zářivé brnění, mazlíček **malý drak** | hvězdný ostrov nad mraky, hvězdná noc |

### 2.2 ❄️ Ledové království (elsa / frozen)

| L | název | avatar | krajina |
|---|---|---|---|
| 1 | Sněhová vločka | holčička v zimním kabátku a čepici | zasněžená vesnička, kouř z komínů |
| 2 | Ledový krystal | šála s vločkami | zamrzlé jezero u vesnice |
| 3 | Ledová princezna | stříbrná čelenka | ledový les, třpytivé stromy |
| 4 | Sněžná tanečnice | třpytivé šaty, brusle | kluziště na jezeře, lampiony |
| 5 | Strážkyně severu | dlouhý modrý plášť | horský průsmyk, sněžné vrcholky |
| 6 | Přítelkyně sobíka | mazlíček **sobík**, saně | saně se sobíkem v zasněženém lese |
| 7 | Mistryně ledu | ledová hůlka, vločky kolem ruky | zahrada ledových soch |
| 8 | Paní polární záře | aura polární záře kolem postavy | nebe s polární září |
| 9 | Ledová kouzelnice | plášť z vloček, mazlíček **sněžná sova** | ledový most přes propast |
| 10 | Paní hor | diadém s krystalem | ledový palác zvenku na vrcholu |
| 11 | Ledová královna | koruna, dlouhá vlečka | trůnní sál paláce |
| 12 | Legenda severu | zářivá aura, mazlíček **ledový drak** | palác pod polární září a hvězdami |

### 2.3 🦄 Duhová říše (unicorn)

Postava = malý jednorožec, kterého si dítě „vychovává“. U nejmladších funguje dobře, když postava roste spolu s nimi.

| L | název | avatar | krajina |
|---|---|---|---|
| 1 | Hvězdička | malé hříbátko bez rohu | louka s kytičkami |
| 2 | Duhová jiskra | mašle v hřívě | duha na obloze |
| 3 | Malý jednorožec | **vyroste růžek** | potůček s kamínky |
| 4 | Třpytivá hříva | duhová hříva | zahrádka s houbičkami |
| 5 | Duhový jednorožec | duhový ocásek | duhový most přes potok |
| 6 | Kamarádka motýlků | mazlíček **motýlek** | motýlí louka |
| 7 | Hvězdný jednorožec | hvězdička na čele | večerní obloha s hvězdami |
| 8 | Obláčková tanečnice | **malá křídla** | louka mezi obláčky |
| 9 | Měsíční jednorožec | měsíční sedlo | velký měsíc nad obláčky |
| 10 | Kouzelný jednorožec | velká třpytivá křídla | hrad na obláčku |
| 11 | Duhová princezna | korunka | duhový zámek |
| 12 | Královna duhy | třpytivá aura, mazlíček **malý pegas** | duhový zámek s ohňostrojem |

### 2.4 🏎️ Závodník (hotwheels) – volitelné téma

| L | název | avatar (auto) | krajina |
|---|---|---|---|
| 1 | Šlapač | šlapací autíčko | dvorek s kužely |
| 2 | Motokárník | motokára | motokárová dráha |
| 3 | Rallyeman | rally auto se střešními světly | prašná lesní cesta |
| 4 | Závodník | závodní auto s číslem | okruh s tribunou |
| 5 | Pouštní jezdec | bugina s velkými koly | pouštní duny |
| 6 | Horský jezdec | terénní auto s navijákem | horské serpentiny |
| 7 | Šampion | auto s pohárem na střeše | stupně vítězů |
| 8 | Nitro | auto s plameny z výfuku | noční město s neony |
| 9 | Kaskadér | auto s křídlem a rampou | skokanský můstek, smyčka |
| 10 | Tryskáč | auto s tryskami | solná pláň, rekordní dráha |
| 11 | Raketoplán | auto-raketa | startovací rampa |
| 12 | Legenda rychlosti | zlaté auto s křídly | dráha mezi planetami |

---

## 3. Grafika

### 3.1 Formáty a umístění
| co | rozměr | formát | cesta |
|---|---|---|---|
| avatar | 512 × 512, průhledné pozadí | PNG nebo WebP | `frontend/src/assets/themes/<theme>/avatar/L01.png` … `L12.png` |
| krajina | 1600 × 900 | WebP (≤ 250 kB) | `frontend/src/assets/themes/<theme>/landscape/L01.webp` … `L12.webp` |
| miniatura krajiny (Mapa, šatník) | 400 × 225 | WebP | `…/landscape/thumb/L01.webp` |

Celkem 24 obrázků na téma. Témata bez hotových obrázků používají fallback: aktuální avatar PNG + emoji odznak úrovně a stávající landscape.

`theme` = `minecraft`, `frozen`, `unicorn`, `racer`. Mapování z `child.avatar`: `minecraft → minecraft`, `elsa → frozen`, `unicorn → unicorn`, `hotwheels → racer`.

### 3.2 Generování obrázků
Postavy a světy jsou **vlastní**, jen ve stylu tématu. Nekopírovat konkrétní postavy z filmů a her (kvůli licenci i proto, že vlastní postava je „Samuelova“, ne cizí).

Postup pro konzistenci:
1. Nejdřív vygeneruj **úroveň 1** a ulož ji jako referenci.
2. Každou další úroveň generuj s referencí na předchozí obrázek a promptem „stejná postava, stejný úhel a styl, změň jen: …“.
3. Krajiny generuj stejně: další úroveň = předchozí scéna + nový prvek, nebo nová scéna ve stejném stylu a světle.

Základní styl promptů:
- **minecraft:** „voxel art, blocky 3D cubes, bright daylight, isometric 3/4 view, clean simple shapes, child-friendly, original character, no text“
- **frozen:** „soft painted children's book illustration, icy blues and silver, sparkling snow, warm friendly face, original character, no text“
- **unicorn:** „cute kawaii illustration, pastel rainbow colors, big shiny eyes, soft glow, for a 4-year-old, original character, no text“
- **racer:** „bright cartoon toy-car style, chunky shapes, glossy paint, dynamic angle, original design, no logos, no text“

Avatar: „full body, centered, transparent background, same pose in every level“.
Krajina: „wide landscape 16:9, no characters, space in the lower third for UI cards“.

---

## 4. Implementace

### 4.1 Backend
- Prahy do `src/main/resources/catalog/levels.json`:
  ```json
  {
    "standard": [0,150,400,800,1400,2200,3300,4800,7000,10000,13500,18000],
    "young":    [0,75,200,400,700,1100,1650,2400,3500,5000,6750,9000],
    "prestigeStep": { "standard": 4000, "young": 2000 }
  }
  ```
  `ProgressService.level()` je čte místo konstant v kódu. „Young“ = `child.age < family.young_age_limit`.
- `LevelInfo` rozšířit: `{ level, xp, currentThreshold, nextThreshold, progressPct, prestigeStars, maxLevel: 12 }`. Na úrovni 12: `nextThreshold` = další hvězda prestiže a `progressPct` k ní.
- Migrace (další volné číslo):
  ```sql
  ALTER TABLE child ADD COLUMN selected_avatar_level INTEGER;
  ALTER TABLE child ADD COLUMN selected_landscape_level INTEGER;
  ```
  Pokud existuje `selected_skin` z `kid-tabs-spec.md`, odstraň ho (`DROP COLUMN`) a nahraď těmito dvěma.
- `PUT /api/children/{id}/appearance` `{ avatarLevel, landscapeLevel }`: validace `1 ≤ hodnota ≤ aktuální level`, nebo `null` (= nejnovější).
- `/progress` vrací i `selectedAvatarLevel`, `selectedLandscapeLevel`.

### 4.2 Frontend
- `constants/themes/<theme>.js`: pole 12 objektů:
  ```js
  { level: 5, title: 'Zlatý krumpáč',
    avatarChange: 'zlatý krumpáč',
    landscapeChange: 'řeka a vodní mlýn',
    avatar: new URL('../../assets/themes/minecraft/avatar/L05.png', import.meta.url).href,
    landscape: new URL('../../assets/themes/minecraft/landscape/L05.webp', import.meta.url).href }
  ```
  Texty přesně podle kapitoly 2. Pro chybějící soubory fallback (3.1).
- Hook `useAppearance(child, progress)` → `{ avatarSrc, landscapeSrc, title, level }` podle výběru v šatníku, jinak nejnovější.
- **Pozadí aplikace** dítěte = `landscapeSrc` (`background-size: cover`, dole jemný gradient do barvy tématu, aby karty byly čitelné). Nahrazuje statický gradient / landscape podle tématu.
- **Avatar** v postranním panelu, horní liště, na Mapě a v Já = `avatarSrc`.
- Horní lišta: „Lvl 5 · Zlatý krumpáč“ + progress bar + ⭐ prestiže.
- **Mapa:** 12 stanovišť s miniaturou krajiny. Odemčené barevně s názvem, zamčené rozmazané (`filter: blur(4px) grayscale(0.6)`) s „?“ a prahem XP. Zvědavost, co tam je, motivuje.
- **Oslava postupu** dle 1.3. Při `prefers-reduced-motion` bez animací, jen statická karta.
- **Šatník** v záložce Já: dva vodorovné pruhy miniatur (Vzhled, Domov), klik = výběr, uloží `PUT /appearance`.
- Rodič v nastavení dítěte vidí aktuální úroveň a může přepnout téma (`child.avatar`). Úroveň i XP zůstanou, mění se jen grafika.

### 4.3 Testy
- prahy: 149 XP → L1, 150 → L2, 17 999 → L11, 18 000 → L12
- mladší dítě: 75 → L2, 9 000 → L12
- prestiž: 18 000 + 7 999 → 1 ⭐, 26 000 → 2 ⭐
- `PUT /appearance` s úrovní vyšší než aktuální → 400; `null` → nejnovější
- level-up v `ApprovalResult` jen při překročení prahu, ne při každém schválení

## 5. Pořadí práce
1. `levels.json` + nové prahy + prestiž v `ProgressService` a `/progress`.
2. Katalogy témat ve frontendu (texty) + fallback grafika, název úrovně v horní liště.
3. Generování obrázků (L1–L4 pro všechna používaná témata stačí na první měsíc, zbytek postupně).
4. Pozadí aplikace podle úrovně + avatar podle úrovně.
5. Mapa s 12 stanovišti.
6. Oslava postupu.
7. Šatník + `PUT /appearance`.

## 6. Hotovo, když
- [ ] Úroveň 2 přijde zhruba za 2 dny, úroveň 12 až po ~8 měsících.
- [ ] Rebeka (do 6 let) postupuje stejně rychle jako dvojčata.
- [ ] Při postupu se avatar viditelně promění a v krajině přibude nový prvek.
- [ ] Na Mapě jsou zamčené krajiny rozmazané a lákají.
- [ ] Dítě si v Já může vybrat starší vzhled nebo domov.
- [ ] Nákup odměny úroveň ani vzhled nezmění.
- [ ] Po úrovni 12 se sbírají hvězdy prestiže.
- [ ] `./mvnw test` a `npm run build` projdou.
