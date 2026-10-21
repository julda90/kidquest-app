# KidQuest – rodinné cíle

Společný cíl celé rodiny: děti nesoutěží, ale táhnou za jeden provaz. Do cíle se body **přičítají navíc**. Dětem se nic neodečítá a jejich osobní body i XP zůstávají.

Navazuje na `points-system-spec.md` (tabulka `family_goal`, schvalování), `morning-routine-spec.md` (rutiny, `first_submitted_on_time`) a `kid-tabs-spec.md` (Mapa). Nahrazuje původní výpočet postupu cíle (součet transakcí od `created_at`) vlastní knihou příspěvků. Všechny texty v UI česky.

---

## 1. Pravidla

### 1.1 Zdroje příspěvků
| zdroj | kolik jde do cíle | kdy |
|---|---|---|
| `TASK` | body úkolu × váha dítěte | při schválení úkolu nebo rutiny |
| `BONUS` | body bonusu × váha dítěte | při schválení (Detektiv chyb, bez připomínání) |
| `TEAM_DAY` | **+50** (bez váhy) | všechny děti, které ten den mají rutinu, ji odeslaly včas a je schválená |
| `SIBLING_HELP` | **+10** (bez váhy) | rodič zaznamená, že dítě pomohlo sourozenci |
| `MANUAL` | ± libovolně | ruční oprava rodičem |

`STREAK`, `CHEST`, `REDEEM` do cíle nejdou.

### 1.2 Váha
- Dítě mladší 6 let má váhu **2**, ostatní **1**. Úkoly pro mladší mají poloviční body, takže přispívají viditelně stejně.
- Uloženo v `family.young_weight` (výchozí 2) a věková hranice v `family.young_age_limit` (výchozí 6), ať jde později upravit.

### 1.3 Týmový den
- Vyhodnocuje se **při schválení rutiny**. Po schválení: vezmi všechny aktivní děti, které mají pro `task.due_date` instanci `ROUTINE`. Pokud jsou **všechny** ve stavu `COMPLETED` s `first_submitted_on_time = true`, přidej `TEAM_DAY` pro ten den.
- Dítě bez rutiny ten den (víkend, nemá šablonu) se nepočítá.
- Nejvýš jednou za den (unique, viz migrace).
- V dětském UI se týmový den ukáže jako oslava „🤝 Týmový den! +50 do cíle“.

### 1.4 Pomoc sourozenci
- Rodič na přehledu klikne „🤝 Pomoc sourozenci“ → vybere kdo komu (dva avatary) a volitelně krátký text („pomohl Sáře obléct“).
- **+10 jde jen do cíle**, ne pomáhajícímu dítěti. Pomoc nemá být obchod.
- Limit 3 záznamy na dítě za den (ochrana před překlikem).
- Dítě uvidí v Deníku „🤝 Pomohl jsi Sáře: +10 do rodinného cíle“.

### 1.5 Dosažení a konec
- Když součet příspěvků ≥ `target_points`: `reached_at = now`, `celebration_pending = true`. Další příspěvky do tohoto cíle už nejdou (žádný přenos do dalšího cíle).
- Cíl nemá termín, který by šlo prošvihnout. Zobrazuje se jen orientační odhad „při tomhle tempu za 9 dní“ (průměr příspěvků za posledních 14 dní).
- Rodič po dosažení cíl **předá** (`delivered_at`): „Pizza noc proběhla ✓“. Do té doby je cíl na přehledu jako „Splněno, čeká na předání“.
- Aktivní je nejvýš jeden cíl. Nový cíl jde založit až po dosažení nebo zrušení předchozího.

### 1.6 Milníky
- Každý cíl má milníky na **25, 50 a 75 %** s volitelným popisem (rodič vyplní při zakládání, např. „50 %: hlasujeme o polevě“).
- Po dosažení milníku dostanou děti při dalším otevření aplikace oslavu s textem milníku.
- Milník může mít navázané **hlasování** (kapitola 1.7).

### 1.7 Hlasování dětí
- Rodič založí hlasování se 2–4 možnostmi (emoji + text). Použití:
  - **výběr dalšího cíle** (možnosti = šablony cílů, kapitola 2),
  - **hlasování u milníku** (možnosti = libovolný text).
- Každé dítě má 1 hlas a do uzavření ho může změnit.
- Hlasování se uzavře, když hlasovaly všechny aktivní děti, nebo když ho rodič uzavře ručně.
- **Shoda:** rozhoduje hlas nejmladšího dítěte, které hlasovalo pro jednu z nerozhodnutých možností. Když žádné takové není, rozhodne rodič.
- U hlasování o cíli se vítězná možnost rovnou založí jako nový aktivní cíl (rodič potvrdí cílovou částku).
- Děti nevidí, kdo jak hlasoval, jen počty hlasů až po uzavření.

## 2. Šablony cílů (katalog)

`src/main/resources/catalog/goals.json`, stejný princip jako katalog úkolů a odměn. Pole: `catalogKey`, `name`, `icon`, `size`, `targetPoints`, `milestones` (texty pro 25/50/75).

Velikost vychází z tempa rodiny ~175 bodů/den (70 + 70 + Rebeka 35 × 2) + týmové dny, tedy ~1 300 za týden.

| catalogKey | cíl | ikona | velikost | body |
|---|---|---|---|---|
| `g_pizza` | Pizza noc s vlastním pečením | 🍕 | SMALL | 2 000 |
| `g_campfire` | Táborák s buřty a příběhy | 🔥 | SMALL | 1 500 |
| `g_games` | Večer deskových her | 🎲 | SMALL | 1 500 |
| `g_stars` | Noc pod hvězdami | 🌌 | SMALL | 2 500 |
| `g_aquapark` | Aquapark | 🏊 | MEDIUM | 5 500 |
| `g_zoo` | ZOO | 🦁 | MEDIUM | 5 000 |
| `g_castle` | Výlet na hrad | 🏰 | MEDIUM | 5 000 |
| `g_cinema` | Kino | 🎬 | MEDIUM | 5 000 |
| `g_birdhouse` | Postavit spolu ptačí budku | 🐦 | PROJECT | 12 000 |
| `g_treehouse` | Domeček na stromě | 🌳 | PROJECT | 15 000 |
| `g_tree` | Zasadit náš strom | 🌱 | PROJECT | 12 000 |
| `g_baby_room` | Připravit pokojíček pro brášku | 👶 | PROJECT | 12 000 |
| `g_train` | Celodenní výlet vláčkem | 🚂 | PROJECT | 15 000 |

Rozsahy podle velikosti (validace ve formuláři, varování mimo rozsah): SMALL 1 500–2 500, MEDIUM 5 000–6 000, PROJECT 12 000–15 000.

Příklad milníků pro `g_pizza`: 25 % „Kupujeme mouku 🌾“, 50 % „Hlasujeme o polevě 🍅“, 75 % „Vybíráme dezert 🍨“.

## 3. Databáze (migrace, další volné číslo)

```sql
ALTER TABLE family ADD COLUMN young_weight INTEGER NOT NULL DEFAULT 2;
ALTER TABLE family ADD COLUMN young_age_limit INTEGER NOT NULL DEFAULT 6;

ALTER TABLE family_goal ADD COLUMN icon VARCHAR(16);
ALTER TABLE family_goal ADD COLUMN catalog_key VARCHAR(50);
ALTER TABLE family_goal ADD COLUMN delivered_at TIMESTAMP;
ALTER TABLE family_goal ADD COLUMN celebration_pending BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX ux_family_goal_active ON family_goal(family_id)
    WHERE reached_at IS NULL AND cancelled_at IS NULL;

CREATE TABLE family_goal_contribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES family_goal(id),
    child_id UUID REFERENCES child(id),            -- NULL u TEAM_DAY
    helped_child_id UUID REFERENCES child(id),     -- jen SIBLING_HELP
    source VARCHAR(20) NOT NULL,                   -- TASK, BONUS, TEAM_DAY, SIBLING_HELP, MANUAL
    amount INTEGER NOT NULL,
    point_transaction_id UUID REFERENCES point_transaction(id),
    day DATE NOT NULL,
    note VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX ux_goal_contrib_tx ON family_goal_contribution(goal_id, point_transaction_id)
    WHERE point_transaction_id IS NOT NULL;
CREATE UNIQUE INDEX ux_goal_contrib_team_day ON family_goal_contribution(goal_id, day)
    WHERE source = 'TEAM_DAY';
CREATE INDEX ix_goal_contrib_goal ON family_goal_contribution(goal_id);

CREATE TABLE goal_milestone (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES family_goal(id) ON DELETE CASCADE,
    percent INTEGER NOT NULL CHECK (percent IN (25, 50, 75)),
    label VARCHAR(100),
    poll_id UUID,
    reached_at TIMESTAMP,
    UNIQUE (goal_id, percent)
);

CREATE TABLE family_poll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id),
    kind VARCHAR(20) NOT NULL,                     -- NEXT_GOAL, MILESTONE
    question VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMP,
    winning_option_id UUID
);
CREATE TABLE family_poll_option (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES family_poll(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    icon VARCHAR(16),
    label VARCHAR(100) NOT NULL,
    goal_catalog_key VARCHAR(50)                   -- u NEXT_GOAL
);
CREATE TABLE family_poll_vote (
    poll_id UUID NOT NULL REFERENCES family_poll(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child(id),
    option_id UUID NOT NULL REFERENCES family_poll_option(id),
    voted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (poll_id, child_id)
);
ALTER TABLE goal_milestone
    ADD CONSTRAINT fk_milestone_poll FOREIGN KEY (poll_id) REFERENCES family_poll(id);
```

Reset (`scripts/fresh-start.sql`) doplnit o `DELETE FROM family_goal_contribution;` a `DELETE FROM family_poll;` před rušením cílů.

## 4. Backend

### 4.1 `FamilyGoalService`
- `contributeFromTransaction(PointTransaction tx)`: volat v `TaskApprovalService.approve` po uložení každé `TASK` / `BONUS` transakce (ve stejné DB transakci). Najde aktivní cíl rodiny; když žádný není, nic nedělá. `amount = tx.amount × weight(child)`, `day = task.due_date ?? today`.
- `checkTeamDay(LocalDate day, UUID familyId)`: volat po schválení úkolu `ROUTINE`. Pravidla viz 1.3.
- `recordSiblingHelp(helperId, helpedId, note)`: validace stejné rodiny, různých dětí a limitu 3/den.
- `afterContribution(goal)`: přepočítá součet (`SUM(amount)`), označí dosažené milníky (`reached_at`), případně dosažení cíle (`reached_at`, `celebration_pending = true`).
- `progress(goalId)` → `{ goal, total, target, pct, byChild: [{childId, amount}], teamDays, helpEvents, milestones[], etaDays }`.
  - `etaDays = ceil((target - total) / avgPerDay14)`, `null` při `avgPerDay14 < 1`.
  - `byChild` sčítá `TASK`, `BONUS` a `SIBLING_HELP` podle `child_id` (u pomoci jde příspěvek pomáhajícímu jen pro zobrazení segmentu). `TEAM_DAY` jako samostatný segment „Tým“.
- Výsledek schválení (`ApprovalResult`) rozšířit o `goalContribution`, `teamDay` (bool), `milestoneReached` (label nebo null), `goalReached`.

### 4.2 `FamilyPollService`
- `create(familyId, kind, question, options[])`, 2–4 možnosti.
- `vote(pollId, childId, optionId)`: upsert. Po hlasu zkontroluj, jestli hlasovaly všechny aktivní děti → `close`.
- `close(pollId)`: spočítá výsledek a pravidlo shody (1.7). U `NEXT_GOAL` vítěze **nezakládá** automaticky. Vrátí `winningOption` a rodič potvrdí založení (kapitola 6.2).

### 4.3 Endpointy
| metoda | cesta | role | popis |
|---|---|---|---|
| GET | `/api/families/{familyId}/goal` | any | aktivní cíl + `progress`; pokud žádný není, poslední dosažený a nepředaný |
| POST | `/api/families/{familyId}/goal` | PARENT | `{ name, icon, targetPoints, catalogKey?, milestones: {25:"",50:"",75:""} }`; 409, když existuje aktivní |
| POST | `/api/goals/{goalId}/cancel` | PARENT | |
| POST | `/api/goals/{goalId}/deliver` | PARENT | po dosažení |
| POST | `/api/goals/{goalId}/celebration-seen` | CHILD/PARENT | `celebration_pending = false` až když ji viděly všechny děti; ukládá se per dítě v `localStorage`, server jen po rodičovském potvrzení |
| GET | `/api/goals/{goalId}/contributions?limit=50` | PARENT | historie příspěvků |
| POST | `/api/families/{familyId}/sibling-help` | PARENT | `{ helperId, helpedId, note }` |
| POST | `/api/goals/{goalId}/contributions` | PARENT | ruční `MANUAL` ± |
| GET | `/api/catalog/goals` | PARENT | šablony cílů |
| GET | `/api/families/{familyId}/polls?open=true` | any | |
| POST | `/api/families/{familyId}/polls` | PARENT | |
| POST | `/api/polls/{pollId}/vote` | CHILD | `{ optionId }` (child z tokenu / zvoleného hráče) |
| POST | `/api/polls/{pollId}/close` | PARENT | |

Všude ověřit, že cíl, hlasování a děti patří do rodiny přihlášeného uživatele.

## 5. Frontend – dítě

### 5.1 Mapa (rodinný cíl)
- Pod osobní XP cestou **společná cesta k cíli**: na začátku domov (mlýn), na konci ikona cíle. Po cestě jede **společné vozidlo** podle tématu (minecraft: důlní vozík, frozen: saně, unicorn: duhový kočár). V něm sedí avatary všech dětí, ne jen přihlášeného.
- Pozice vozidla = `pct`. Milníky jako zastávky s popiskem, dosažené barevně.
- Pod cestou pruh rozdělený na barevné segmenty podle dětí + segment „🤝 Tým“. **Bez čísel u jednotlivých dětí a bez pořadí**, jen barvy a avatary.
- Text: „🍕 Pizza noc · 1 340 / 2 000 · při tomhle tempu za 4 dny“.
- Když není aktivní cíl a probíhá hlasování o dalším, místo cesty karta hlasování (5.3).

### 5.2 Oslavy (overlay, jednou na dítě)
- **Příspěvek po schválení:** malá animace „+20 do 🍕“ u vozidla.
- **Týmový den:** „🤝 Týmový den! Všichni jste to ráno zvládli. +50 do cíle.“
- **Milník:** „🎉 Jsme v půlce! Hlasujeme o polevě 🍅“ (+ tlačítko na hlasování, je-li navázané).
- **Dosažený cíl:** velká oslava s vozidlem v cíli, konfety podle tématu, text „Dokázali jste to spolu! 🍕 Pizza noc“.
- Kterou oslavu dítě vidělo, se ukládá v `localStorage` (`kq.seen.<childId>.<eventId>`).

### 5.3 Hlasování
- Karta s otázkou a 2–4 velkými tlačítky s ikonou (pro Rebeku čitelné i bez čtení).
- Po hlasu: „Hlasoval jsi pro 🍕. Čekáme na ostatní…“ (bez prozrazení cizích hlasů). Dokud je otevřené, jde hlas změnit.
- Po uzavření: výsledek s počty a vítěz.

### 5.4 Výzvy
- V pruhu stavu malý ukazatel cíle „🍕 67 %“ (klik → Mapa).
- U ranní rutiny, když ji ostatní sourozenci už odeslali: „Sára a Rebeka už jsou hotové. Dokážeš to taky a bude týmový den? 🤝“.

## 6. Frontend – rodič

### 6.1 Přehled (Dashboard)
- Karta **Rodinný cíl**: název, progress, segmenty dětí (tady s čísly), ETA, milníky.
- Tlačítko **„🤝 Pomoc sourozenci“** → malý dialog: dva řádky avatarů (Kdo pomohl / Komu), poznámka, „Zapsat +10“.
- Po dosažení: „✅ Splněno, čeká na předání“ + tlačítko „Proběhlo ✓“.
- Bez aktivního cíle: „Žádný rodinný cíl. [Vybrat cíl] [Nechat děti hlasovat]“.

### 6.2 Založení cíle
Dialog se dvěma cestami:
1. **Vybrat sám:** seznam šablon podle velikosti (SMALL / MEDIUM / PROJECT) + „Vlastní cíl“. U každé ETA „≈ 11 dní při současném tempu“. Formulář: ikona, název, cílové body (s rozsahem podle velikosti), texty milníků 25/50/75, u každého milníku přepínač „Hlasování“ + 2–4 možnosti.
2. **Nechat děti hlasovat:** vybrat 2–4 šablony → vytvoří `NEXT_GOAL` hlasování. Po uzavření se rodiči ukáže „Děti vybraly 🏊 Aquapark. [Založit cíl 5 500] [Upravit]“.

### 6.3 Historie
Sekce „Rodinné cíle“ v Nastavení: dosažené cíle s datem dosažení a předání, počtem týmových dnů a pomocí. Děti ji vidí v Trofejích jako „Naše společné úspěchy“ (bez rozpadu podle dětí).

## 7. Testy
- `TASK` 20 od dítěte 7 let → příspěvek 20; od dítěte 4 roky → 40
- `STREAK` a `CHEST` nic nepřispějí
- dvojí schválení → druhý příspěvek nevznikne (unique `point_transaction_id`)
- týmový den: 3 děti s rutinou, 2 schválené včas → nic; po třetím → +50; čtvrté schválení téhož dne → nic
- týmový den: dítě bez rutiny ten den (víkendová šablona) se nepočítá
- rutina odeslaná po termínu (`first_submitted_on_time = false`) týmový den nespustí
- pomoc sourozenci: stejné dítě komu i kdo → 400; 4. záznam za den → 429
- dosažení cíle: `reached_at`, `celebration_pending`; další schválení už nepřispívá
- milníky 25/50/75 se označí ve správném okamžiku, každý jednou
- hlasování: 2:1 → vítěz; 1:1:1 → vyhraje volba nejmladšího; žádný hlas nejmladšího u shody → `winning_option_id = NULL`, rozhodne rodič
- druhý aktivní cíl → 409
- ETA: bez dat → `null`

## 8. Pořadí práce
1. Migrace + `family_goal_contribution` + napojení na schvalování (váha, `TASK`/`BONUS`).
2. Progress endpoint + karta cíle na přehledu rodiče + založení cíle ze šablon.
3. Mapa: společná cesta, vozidlo, segmenty.
4. Týmový den (závisí na ranní rutině).
5. Pomoc sourozenci.
6. Milníky a oslavy.
7. Hlasování (milníky i další cíl).
8. Historie cílů, úprava `fresh-start.sql`.

## 9. Hotovo, když
- [ ] Každý schválený úkol posune rodinný cíl, aniž by dítěti ubyly body.
- [ ] Sářiny úkoly se do cíle počítají dvojnásobně.
- [ ] Když všechny děti stihnou ranní rutinu, cíl dostane +50 a děti vidí oslavu týmového dne.
- [ ] Rodič zapíše pomoc sourozenci dvěma kliky.
- [ ] Na Mapě jede společné vozidlo se všemi avatary; děti nevidí žádné pořadí.
- [ ] Milníky 25/50/75 % mají vlastní oslavu a volitelné hlasování.
- [ ] Děti můžou hlasovat o dalším cíli a shodu rozhodne nejmladší.
- [ ] Cíl nikdy „nepropadne“, ukazuje se jen odhad.
- [ ] `./mvnw test` a `npm run build` projdou.
