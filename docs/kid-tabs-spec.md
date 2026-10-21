# KidQuest – záložky dětské aplikace (implementační zadání, fáze 7)

Navazuje na `docs/points-system-spec.md` (body, XP, úrovně, série, odznaky, truhla, rodinný cíl, nákup odměn).
Cíl: každá záložka má jednu jasnou roli a dvě měny zůstávají oddělené. **Body** se utrácejí v Obchodě. **XP** ukazuje Mapa a nikdy neklesá.

Pracuj po krocích v pořadí sekcí. Po každém kroku musí projít `./mvnw test` a `npm run build` ve `frontend/`. Všechny texty v UI česky.

---

## 1. Opravy (udělat první)

### 1.1 XP je 0, přestože dítě má body a splněné úkoly
Transakce z doby před zavedením typů mají `type = 'MANUAL'` (reason „Points added manually“ z `Children.jsx`), takže se nepočítají do XP.

Nová migrace (další volné číslo `Vn__backfill_legacy_xp.sql`):

```sql
-- kladné transakce vzniklé před nasazením systému bodů se počítají jako odměna za úkol
UPDATE point_transaction
SET type = 'TASK'
WHERE type = 'MANUAL'
  AND amount > 0
  AND task_id IS NULL
  AND created_at < (SELECT installed_on FROM flyway_schema_history
                    WHERE description = 'points system' ORDER BY installed_rank LIMIT 1);
```

Uprav `description` podle skutečného názvu migrace systému bodů ve `flyway_schema_history`. Záporné `MANUAL` transakce nech být.

Test: dítě se 164 body ze starých kladných transakcí má po migraci XP ≥ 164 a úroveň podle prahů.

### 1.2 Názvy úrovní podle tématu
Profil ukazuje „Úroveň 1 Nováček“. Musí se použít názvy z `constants/levels.js` podle avataru dítěte:
- minecraft: Dřevěný, Kamenný, Železný, Zlatý, Diamantový, Netheritový krumpáč
- frozen (elsa): Sněhová vločka, Ledový krystal, Ledová princezna, Strážkyně severu, Mistryně ledu, Ledová královna
- unicorn: Hvězdička, Duhová jiskra, Malý jednorožec, Duhový jednorožec, Kouzelný jednorožec, Královna duhy

„Nováček“ zůstane jen jako fallback pro neznámý avatar.

### 1.3 Texty transakcí
- Výchozí `reason` v `Children.jsx` změň na „Body od rodičů“ / „Oprava bodů“ (místo „Points added manually“ / „Points deducted manually“).
- V dětském UI existující staré texty mapuj: `Points added manually` → „Body od rodičů“, `Points deducted manually` → „Oprava bodů“.
- U transakcí typu `TASK` a `BONUS` zobrazuj název úkolu (`task.title`), ne `reason`.

### 1.4 Stav odměny
Štítek „SPLNĚNO!“ u odměny, na kterou má dítě body, nahraď textem **„Můžeš si ji vzít!“**. „Splněno“ zní, jako by odměnu už dostalo.

### 1.5 Ikony odměn
Všechny odměny mají 🎁. Použij `reward.icon`. Když chybí, zůstane 🎁. V `RewardForm.jsx` nabídni výběr z ~20 emoji (🍦 🍫 🍕 🎬 🎮 🧗 🎳 🧩 🧱 📚 🎨 🚲 🏊 🎡 🐴 🍰 🧸 ⚽ 🎟️ 🌙).

---

## 2. Navigace

Pět záložek v postranním panelu, v tomto pořadí. Ikony a názvy podle tématu:

| route | minecraft | frozen | unicorn | role |
|---|---|---|---|---|
| `/kid/today` | ⛏️ Výzvy | ⚔️ Výzvy | 🦄 Kouzla | co mám udělat teď |
| `/kid/map` | 🗺️ Svět | 🏰 Království | 🌈 Duha | kam se posouvám (XP) |
| `/kid/shop` | 💎 Obchod | 🎁 Obchod | 🎁 Obchod | za co utratím body |
| `/kid/trophies` | 🏆 Trofeje | 👑 Trofeje | ⭐ Hvězdy | co jsem dokázal |
| `/kid/me` | 👤 Já | 👤 Já | 👤 Já | kdo jsem |

V horní liště vždy: pozdrav, **zůstatek bodů** s ikonou měny a malý progress bar úrovně (název úrovně + %). Kliknutím na progress bar přejdeš na Mapu.

---

## 3. Záložka Výzvy (`/kid/today`)

Pořadí bloků shora:

1. **Pruh stavu**: série „🔥 N dní“ + stav žolíku („žolík: volný“ / „žolík: použitý“), vpravo truhla 🧰, když je `chestAvailable` (pulzuje, klik → `POST /chest/open` → animace a částka).
2. **Ranní rutina** (stávající).
3. **Dnešní úkoly**: úkoly přiřazené dítěti se stavem `ASSIGNED`, `PENDING_APPROVAL`, nebo `COMPLETED` dnes.
   - Tlačítko „Hotovo!“ → `POST /api/tasks/{id}/submit` → karta přejde do stavu „Čeká na tátu/mámu ✋“.
   - Schválené dnes: zelené zaškrtnutí a „+N“.
   - `REJECTED`: „Zkus to znovu“, tlačítko Hotovo zase aktivní.
4. **Vedlejší questy**: úkoly k dispozici vždycky, které si dítě samo vezme.
   - Backend: nový příznak `task.is_open_quest BOOLEAN NOT NULL DEFAULT false` a `task.template_id`. Otevřený quest je šablona v rodině bez `assignedTo`. Dítě zavolá `POST /api/tasks/{id}/claim` → vytvoří se kopie úkolu přiřazená dítěti ve stavu `ASSIGNED`. Šablona zůstává.
   - Limit: max 3 claimy stejné šablony za den na dítě (konfigurovatelné na šabloně `daily_limit`).
   - Rodič v `TaskForm.jsx` zaškrtne „Vedlejší quest (k dispozici vždy)“.
   - Typické questy: Nosit dřevo, Štípat třísky, Složit prádlo.
5. **Prázdný stav**: zobrazit jen tehdy, když nejsou ani dnešní úkoly, ani vedlejší questy: „Pro dnešek hotovo! Zítra tě čekají nové výzvy.“ Nikdy jen „Žádné úkoly“, když existují questy.

---

## 4. Záložka Mapa (`/kid/map`)

Ukazuje **XP, ne body**. Mapa se nikdy nevrací zpátky.

- Vodorovně posouvatelná cesta (na tabletu na šířku) se 6 stanovišti = 6 úrovní. Pozadí podle tématu:
  - minecraft: les → jeskyně → železný důl → zlatý důl → diamantová hloubka → Nether
  - frozen: vesnice → zamrzlé jezero → ledový les → horský průsmyk → ledový palác → trůnní sál
  - unicorn: louka → duhový most → oblaka → hvězdné pole → měsíc → duhový zámek
- Avatar stojí mezi stanovišti podle `(xp - currentThreshold) / (nextThreshold - currentThreshold)`.
- Dosažená stanoviště barevně s názvem úrovně, budoucí šedě s prahem XP („ještě 340 XP“).
- U každého stanoviště ikona skinu, který úroveň odemyká (viz Já).
- Pod cestou **rodinný cíl**: společný progress bar, název cíle, příspěvky dětí jako barevné segmenty s avatary (bez pořadí a bez „kdo vede“).
- Současnou čáru s odměnami podle bodů z Mapy odstraň. Patří do Obchodu.
- Při level-upu (z `ApprovalResult.levelUp`, nebo když `/progress` vrátí vyšší level než minule uložený v `localStorage`) přehrát animaci: avatar dojde na nové stanoviště + konfety podle tématu.

---

## 5. Záložka Obchod (`/kid/shop`)

Vychází ze stávající obrazovky karet odměn.

- Nahoře zůstatek bodů + text „Další odměna: Jumppark, ještě 36 💎“.
- Karty odměn seřazené podle ceny, ikona z `reward.icon`.
  - Dosažitelná: zvýrazněná, štítek „Můžeš si ji vzít!“, tlačítko „Chci tuhle odměnu!“ → `POST /api/rewards/{id}/redeem` → potvrzovací krok přímo v kartě („Opravdu? Odečte se 50 💎“ / „Ano“ / „Ještě ne“). Nepoužívat `window.confirm`.
  - Nedosažitelná: progress bar a „ještě N“.
- Odměny s `childId` jiného dítěte nezobrazovat.
- Nová sekce **Moje žádosti** pod kartami: seznam `reward_redemption` dítěte za posledních 30 dní se stavem:
  - `REQUESTED` → „Čeká na schválení ✋“
  - `APPROVED` → „Schváleno, brzy ji dostaneš 🎉“
  - `DELIVERED` → „Předáno ✓“ (datum)
  - `CANCELLED` → „Zrušeno“ (body se vracejí, protože se `REDEEM` nevytvořil)
- Endpoint: `GET /api/redemptions/child/{childId}?days=30`.

---

## 6. Záložka Trofeje (`/kid/trophies`)

Místo současného výpisu transakcí (ten se přesouvá do Já → Deník).

- Horní řádek 3 karet: **Nejdelší série**, **Nejvíc úkolů za den**, **Splněno celkem**.
  - Backend: rozšiř `/progress` o `records { longestStreak, bestDayTasks, totalTasks }`.
- **Mřížka odznaků**, 3–4 sloupce:
  - získané barevně s datem,
  - rozpracované šedě s průběhem „🪵 Dřevorubec 7/10“ a mini progress barem (rozpracovaný odznak motivuje víc než hotový),
  - řazení: rozpracované od nejbližšího ke splnění, pak získané, pak nezačaté.
  - Backend: rozšiř `/progress.badges` na `[{ badge, earned, earnedAt, current, target }]`.
- Klik na odznak otevře detail: název, popis, jak ho získat.

Doplň odznaky (enum `Badge`):
| badge | název | podmínka |
|---|---|---|
| `STREAK_7` | Týden v kuse | série 7 dní |
| `STREAK_30` | Měsíc v kuse | série 30 dní |
| `EARLY_BIRD` | Ranní ptáče | 10× kompletní ranní rutina |
| `FIRST_REWARD` | První nákup | první `DELIVERED` odměna |
| `TEAM_PLAYER` | Týmový hráč | dosažený rodinný cíl |

---

## 7. Záložka Já (`/kid/me`)

- **Rozložení**: vycentrovat. Teď je obsah natlačený vpravo a levá polovina je prázdná. Na tabletu na šířku 2 sloupce: vlevo avatar se skiny, vpravo statistiky.
- **Avatar a skiny**: každá úroveň odemyká jeden skin (rámeček nebo doplněk k avataru). Skiny nic nestojí, jsou to odměny bez peněz.
  - minecraft: rámeček podle materiálu krumpáče (dřevo, kámen, železo, zlato, diamant, netherit)
  - frozen: vločka, krystal, korunka, plášť, žezlo, koruna
  - unicorn: hvězdička, duha, křídla, třpytky, roh, koruna
  - Backend: `child.selected_skin VARCHAR(30)`, `PUT /api/children/{id}/skin` (validuje, že skin je odemčený úrovní). Zamčené skiny šedě s „Úroveň N“.
- **Statistiky**: body, XP + úroveň, série, splněné úkoly (stávající karty).
- **Deník**: dosavadní obsah Trofejí, česky, seskupený po dnech („Dnes“, „Včera“, datum), max 50 posledních, „Načíst další“.
  - Řádek: ikona podle typu (`TASK` 📝 / `BONUS` 🔍 / `STREAK` 🔥 / `CHEST` 🧰 / `REDEEM` 🎁 / `MANUAL` ✋), text, částka (záporné `REDEEM` šedě, ne červeně).
- „Změnit hráče“ a „Odhlásit“ zůstávají dole.

---

## 8. Co do aplikace nedávat

- **Žebříček nebo pořadí sourozenců**, a to ani v rodinném cíli. U dvojčat z toho vznikne soupeření a ten, kdo prohrává, přestane hrát.
- Záporné body jako trest ani červená čísla v deníku.
- Odpočty času, které tlačí do spěchu.

---

## 9. Pořadí práce

1. Opravy z kapitoly 1 (migrace backfill XP, názvy úrovní, texty, „Můžeš si ji vzít!“, ikony).
2. Navigace a routy (kapitola 2), přesun výpisu transakcí do Já → Deník.
3. Výzvy včetně vedlejších questů (claim endpoint + migrace).
4. Obchod: Moje žádosti.
5. Trofeje: rekordy a mřížka odznaků s průběhem.
6. Mapa: XP cesta, rodinný cíl, level-up animace.
7. Já: skiny.

## 10. Hotovo, když

- [ ] Dítě s historickými body má nenulové XP a správný tematický název úrovně.
- [ ] Nikde v dětském UI není anglický text.
- [ ] Výzvy nikdy neukazují prázdnou obrazovku, pokud existují vedlejší questy.
- [ ] Mapa ukazuje XP a po nákupu odměny se nezmění.
- [ ] Dítě vidí stav svých žádostí o odměny.
- [ ] Trofeje ukazují odznaky s průběhem, ne seznam transakcí.
- [ ] Skin jde vybrat jen odemčený.
- [ ] `./mvnw test` a `npm run build` projdou.
