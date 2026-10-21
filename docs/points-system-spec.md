# KidQuest – systém bodů, XP a odměn (implementační zadání)

Zadání pro implementaci v tomto repozitáři (Spring Boot + Flyway + PostgreSQL, frontend React/Vite v `frontend/`).
Vizuální návrh: artefakt „KidQuest Redesign“, záložka **🏆 Systém bodů**.

Pracuj po fázích (viz konec). Po každé fázi musí projít `./mvnw test` a `npm run build` ve `frontend/`.

---

## 0. Současný stav (z čeho vycházíme)

- `point_transaction` je append-only kniha bodů (`child_id`, `amount`, `reason`, `created_at`). V7 z ní odstranila `task_id`.
- Body za úkol připisuje **frontend** dvěma oddělenými voláními (`updateTask` → `COMPLETED`, pak `createPointTransaction`) v `Dashboard.jsx` a `Tasks.jsx`. Není to atomické a cyklus stavů `COMPLETED → UNASSIGNED → … → COMPLETED` umožní připsat body za stejný úkol víckrát.
- `Reward` má jen `pointCost` a `active`. Nákup odměny neexistuje.
- Zůstatek se počítá na frontendu (`RewardsProgress.jsx`).
- `Child.avatar` určuje téma (`elsa` → frozen, `unicorn`, nově `minecraft`).

## 1. Pravidla systému (doménová logika)

### Dvě měny
- **Body (balance)** = součet `amount` všech transakcí dítěte. Utrácí se za odměny.
- **XP** = součet `amount` transakcí typu `TASK`, `BONUS`, `STREAK`, `CHEST`. Nikdy neklesá. Nákup (`REDEEM`) ani ruční oprava (`MANUAL`) XP neovlivní.

### Druhy úkolů (`TaskKind`) a výchozí body
| kind | skupina | výchozí body (≥ 6 let) | výchozí body (< 6 let) | bonus |
|---|---|---|---|---|
| `TABLE` (prostřít stůl) | DUTY | 10 | 10 | – |
| `LAUNDRY` (složit prádlo) | DUTY | 15 | 10 | – |
| `ROOM` (uklidit pokoj) | DUTY | 20 | 15 | – |
| `HOMEWORK` (domácí úkol) | SCHOOL | 20 | – | +15 „Detektiv chyb“ |
| `WOOD` (nosit dřevo) | BIG | 30 | 10 | – |
| `KINDLING` (štípat třísky) | BIG | 40 | – | – |
| `BIG_OTHER` (rovnocenná velká práce) | BIG | 40 | – | – |
| `OTHER` | OTHER | 10 (ruční) | 10 | – |

Výchozí body jsou jen předvyplnění ve formuláři. `Task.pointValue` zůstává zdrojem pravdy.

**Detektiv chyb:** u `HOMEWORK` rodič při schválení zaškrtne „dítě si úkol samo zkontrolovalo a opravilo chybu“ a připíše se navíc `bonusValue` (výchozí 15) jako transakce `BONUS`. Neodměňujeme „bez chyby“, odměňujeme sebekontrolu.

### Úrovně (XP prahy)
- Děti ≥ 6 let: `[0, 200, 600, 1500, 3000, 6000]`
- Děti < 6 let: `[0, 100, 300, 750, 1500, 3000]`

Názvy úrovní podle tématu drží frontend:
- minecraft: Dřevěný, Kamenný, Železný, Zlatý, Diamantový, Netheritový krumpáč
- frozen (elsa): Sněhová vločka, Ledový krystal, Ledová princezna, Strážkyně severu, Mistryně ledu, Ledová královna
- unicorn: Hvězdička, Duhová jiskra, Malý jednorožec, Duhový jednorožec, Kouzelný jednorožec, Královna duhy

### Série (streak) s žolíkem
- Den je „aktivní“, pokud má dítě ten den (Europe/Prague) aspoň jednu transakci `TASK`.
- Série = počet aktivních dnů počítaných zpět od dneška (nebo od včerejška, pokud dnes zatím nic). Neaktivní den sérii nepřeruší, pokud je **první neaktivní den v daném ISO týdnu** (žolík). Druhý neaktivní den v týdnu sérii ukončí. Dny přes žolík se do délky série nepočítají.
- Když schválení úkolu posune sérii na násobek 7, připiš `STREAK` transakci +30 (max. jednou za den, idempotentně).

### Odznaky
Definice v kódu (enum `Badge`), počítá se počet úkolů ve stavu `COMPLETED` daného druhu:
| badge | podmínka |
|---|---|
| `LUMBERJACK` (Dřevorubec) | 10× `WOOD` nebo `KINDLING` |
| `SHERLOCK` (Detektiv) | 10× `BONUS` u `HOMEWORK` |
| `HEAD_WAITER` (Hlavní číšník) | 20× `TABLE` |
| `TIDY` (Pořádníček) | 20× `ROOM` |
| `LAUNDRY_PRO` (Mistr prádla) | 20× `LAUNDRY` |

Odznak se uloží jednou (`child_badge`, unique `child_id + badge`) a už nezmizí.

### Truhla s překvapením
- Jednou za ISO týden: jakmile dítě v jednom dni dosáhne 3 transakcí `TASK`, truhla se odemkne (stav se počítá, neukládá).
- Dítě ji otevře `POST /api/children/{id}/chest/open` → `CHEST` transakce s náhodnou hodnotou 10–30 (krok 5). Druhé otevření ve stejném týdnu vrátí 409.

### Rodinný cíl
- Tabulka `family_goal`. Aktivní je nejvýš jeden cíl na rodinu (`reached_at IS NULL AND cancelled_at IS NULL`).
- Postup = součet `amount` transakcí `TASK` + `BONUS` všech dětí rodiny od `created_at` cíle. **Dětem se nic neodečítá.**
- Když postup dosáhne `target_points`, nastav `reached_at` (při schvalování úkolu).

### Odměny a nákup
- `Reward` dostane `tier` (`SMALL`, `MEDIUM`, `BIG`, `MEGA`), `icon` a volitelné `child_id` (odměna jen pro konkrétní dítě, třeba levnější odměny pro Rebeku). `child_id = NULL` znamená pro všechny.
- Doporučené ceny pro starší děti: SMALL 100–150, MEDIUM 400–600, BIG 1500–2500, MEGA 4000+. Pro mladší než 6 let 30–300.
- Nákup: `reward_redemption` se stavy `REQUESTED → APPROVED → DELIVERED`, případně `CANCELLED`.
  - Žádost může podat dítě i rodič. Kontrola: `balance - součet cen REQUESTED žádostí ≥ cena`, jinak 400 „Nemáš dost bodů“.
  - Schválení (jen PARENT) vytvoří `REDEEM` transakci se zápornou cenou a nastaví `approved_at`.
  - Předání (PARENT) nastaví `DELIVERED` a `delivered_at`. Přehled rodiče ukazuje schválené a dosud nepředané odměny.

### Ochranná pravidla
- Body připisuje **jen backend při schválení úkolu**. Frontend už `createPointTransaction` při dokončení úkolu nevolá.
- Jeden úkol nemůže připsat `TASK` ani `BONUS` dvakrát (unique index, viz migrace). Při opakovaném schválení vrať 409.
- `MANUAL` transakce (ruční oprava) zůstává pro rodiče, ale v UI se jmenuje „Oprava bodů“ a nepočítá se do XP. Body se nepoužívají jako trest.

## 2. Databáze – `V8__points_system.sql`

```sql
-- druh úkolu a bonus
ALTER TABLE task ADD COLUMN kind VARCHAR(30) NOT NULL DEFAULT 'OTHER';
ALTER TABLE task ADD COLUMN bonus_value INTEGER NOT NULL DEFAULT 0;
ALTER TABLE task ADD COLUMN approved_at TIMESTAMP;

-- typ transakce + vazba na úkol kvůli idempotenci
ALTER TABLE point_transaction ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'MANUAL';
ALTER TABLE point_transaction ADD COLUMN task_id UUID REFERENCES task(id);
ALTER TABLE point_transaction ADD COLUMN redemption_id UUID;
CREATE UNIQUE INDEX ux_point_tx_task_type ON point_transaction(task_id, type) WHERE task_id IS NOT NULL;
CREATE INDEX ix_point_tx_child_created ON point_transaction(child_id, created_at);

-- odměny
ALTER TABLE reward ADD COLUMN tier VARCHAR(20) NOT NULL DEFAULT 'SMALL';
ALTER TABLE reward ADD COLUMN icon VARCHAR(16);
ALTER TABLE reward ADD COLUMN child_id UUID REFERENCES child(id);

CREATE TABLE reward_redemption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID NOT NULL REFERENCES reward(id),
    child_id UUID NOT NULL REFERENCES child(id),
    point_cost INTEGER NOT NULL,           -- cena v okamžiku žádosti
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);
ALTER TABLE point_transaction
    ADD CONSTRAINT fk_point_tx_redemption FOREIGN KEY (redemption_id) REFERENCES reward_redemption(id);

CREATE TABLE child_badge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child(id),
    badge VARCHAR(30) NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (child_id, badge)
);

CREATE TABLE family_goal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id),
    name VARCHAR(200) NOT NULL,
    target_points INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reached_at TIMESTAMP,
    cancelled_at TIMESTAMP
);
```

Existující transakce zůstanou typu `MANUAL`. Volitelně je jednorázově přeznač: transakce s kladnou částkou, jejichž `reason` odpovídá textu, který dnes posílá frontend při dokončení úkolu, nastav na `TASK` (zkontroluj formát `reason` v `Dashboard.jsx`/`Tasks.jsx`). Jinak by starší děti začínaly s XP 0.

Aplikace běží s `ddl-auto: validate`, takže entity musí přesně odpovídat migraci.

## 3. Backend

### Model
- `enum TaskKind { TABLE, LAUNDRY, ROOM, HOMEWORK, WOOD, KINDLING, BIG_OTHER, OTHER }` s metodami `group()` a `defaultPoints(boolean young)`.
- `enum TransactionType { TASK, BONUS, STREAK, CHEST, REDEEM, MANUAL }` s `boolean countsToXp()`.
- `enum RewardTier { SMALL, MEDIUM, BIG, MEGA }`, `enum RedemptionStatus { REQUESTED, APPROVED, DELIVERED, CANCELLED }`, `enum Badge { … }`.
- `Task`: `kind` (`@Enumerated(STRING)`), `bonusValue`, `approvedAt`.
- `PointTransaction`: `type`, `task` (`@ManyToOne`, nullable), `redemption` (`@ManyToOne`, nullable).
- `Reward`: `tier`, `icon`, `child` (nullable).
- Nové entity `RewardRedemption`, `ChildBadge`, `FamilyGoal` a jejich repozitáře.
- DTO: `TaskRequest`/`TaskResponse` + `kind`, `bonusValue`; `RewardRequest`/`RewardResponse` + `tier`, `icon`, `childId`; `PointTransactionResponse` + `type`, `taskId`.

### Nová služba `ProgressService`
- `int balance(UUID childId)`, `int xp(UUID childId)` jako agregační JPQL dotazy (`SUM(amount)`, u XP s filtrem `type IN :xpTypes`), nepočítat v Javě přes celý seznam.
- `LevelInfo level(Child child)` → `{ level (1-based), xp, currentThreshold, nextThreshold (null na max), progressPct }`. Mladší než 6 let podle `child.age`.
- `StreakInfo streak(UUID childId, LocalDate today)` → `{ days, jokerUsedThisWeek }`. Čistá funkce nad množinou aktivních dnů, kvůli testovatelnosti.
- `boolean chestAvailable(UUID childId, LocalDate today)`.
- `FamilyGoalProgress goalProgress(UUID familyId)`.
- Čas: injektuj `java.time.Clock` (bean se zónou `Europe/Prague`), ať jdou série a truhla testovat.

### Schválení úkolu – `TaskApprovalService.approve(taskId, ApproveRequest{ boolean bonus })`, `@Transactional`
1. Načti úkol. Musí mít `assignedTo` a stav `PENDING_APPROVAL` nebo `ASSIGNED`, jinak 400.
2. `status = COMPLETED`, `approvedAt = now`.
3. Ulož `TASK` transakci (`amount = pointValue`, `task`, `reason = title`).
4. Pokud `bonus && bonusValue > 0`, ulož `BONUS` transakci (`reason = "Detektiv chyb: " + title`).
5. Pokud série po zápisu dosáhla násobku 7 a dnes ještě není `STREAK` transakce, připiš +30.
6. Vyhodnoť odznaky (vlož chybějící, `ON CONFLICT` neřeš, kontroluj existenci).
7. Aktualizuj rodinný cíl (`reached_at`).
8. Vrať `ApprovalResult { task, awardedPoints, newBadges[], levelUp (bool), newLevel, streakDays, goalReached }`. Frontend podle toho spustí oslavu.

`reject(taskId)` → `REJECTED`, žádné body.

`TaskService.updateTask` už nesmí přepnout stav na `COMPLETED`. Pokud request posílá `COMPLETED`, vrať 400 s odkazem na `/approve`. Přechod z `COMPLETED` jinam je povolen, ale body se nevrací ani znovu nepřipíšou.

### Endpointy
| metoda | cesta | role | popis |
|---|---|---|---|
| POST | `/api/tasks/{taskId}/approve` | PARENT | body `{ "bonus": true }`, vrací `ApprovalResult` |
| POST | `/api/tasks/{taskId}/reject` | PARENT | |
| POST | `/api/tasks/{taskId}/submit` | CHILD/PARENT | `ASSIGNED → PENDING_APPROVAL` |
| GET | `/api/children/{childId}/progress` | any | `{ balance, xp, level, streak, badges[], chestAvailable, pendingRedemptionPoints }` |
| POST | `/api/children/{childId}/chest/open` | CHILD/PARENT | vrací `{ amount }`, 409 pokud už otevřena |
| GET | `/api/families/{familyId}/goal` | any | aktivní cíl + postup |
| POST | `/api/families/{familyId}/goal` | PARENT | `{ name, targetPoints }`, předchozí aktivní cíl zruší (`cancelled_at`) |
| POST | `/api/rewards/{rewardId}/redeem` | CHILD/PARENT | body `{ childId }` → `RewardRedemption` (REQUESTED) |
| POST | `/api/redemptions/{id}/approve` | PARENT | vytvoří `REDEEM` transakci |
| POST | `/api/redemptions/{id}/deliver` | PARENT | |
| POST | `/api/redemptions/{id}/cancel` | PARENT | jen z `REQUESTED` |
| GET | `/api/redemptions/family/{familyId}?status=` | PARENT | |
| GET | `/api/tasks/kinds` | any | seznam `TaskKind` s výchozími body, pro formulář |

Role kontroluj stejným mechanismem, jaký už používá `SecurityConfig` (pokud je zapnuté `@EnableMethodSecurity`, použij `@PreAuthorize("hasRole('PARENT')")`, jinak kontrola v service přes `AppUser.role`). U všech endpointů ověř, že dítě, úkol nebo odměna patří do rodiny přihlášeného uživatele.

`PointTransactionController.create` zůstává jen pro `MANUAL` opravy a typ vždy nastaví na `MANUAL`.

## 4. Frontend

- `api/tasks.js`: přidej `approveTask(id, bonus)`, `rejectTask(id)`, `submitTask(id)`, `getTaskKinds()`.
- Nový `api/progress.js` (`getChildProgress`, `openChest`), `api/redemptions.js`, `api/goals.js`.
- **`Dashboard.jsx` a `Tasks.jsx`**: odstraň `createPointTransaction` při dokončení. Tlačítko schválení volá `approveTask`. U `HOMEWORK` ukaž checkbox „🔍 Sám/sama našel(a) a opravil(a) chybu (+15)“. Po úspěchu zobraz toast s `awardedPoints`, novými odznaky a level-upem.
- `STATUS_CYCLE` už nesmí vést do `COMPLETED`. Do `COMPLETED` se jde jen přes schválení.
- **`TaskForm.jsx`**: select „Druh úkolu“ (`kind`), který předvyplní `pointValue` podle věku vybraného dítěte. U `HOMEWORK` pole „Bonus za Detektiva chyb“ (výchozí 15).
- **`RewardForm.jsx`**: `tier`, `icon` (emoji), volitelně „Jen pro dítě“. Pod cenou nápověda podle tieru („Malá: 100–150, asi 1–2 dny práce“).
- **`RewardsProgress.jsx`**: zůstatek a XP z `/progress`, ne z počítání transakcí. Úroveň s názvem podle tématu a progress barem. Tlačítko „Chci tuhle odměnu“ (`redeem`), aktivní jen když na ni dítě má. Série „🔥 N dní“ s indikací žolíku („žolík tento týden: použitý / volný“). Odznaky (získané barevně, nezískané šedě s počtem „7/10“). Truhla, pokud `chestAvailable`.
- Nový soubor `constants/levels.js`: názvy úrovní podle avataru (viz sekce 1) a mapování avatar → téma (`elsa → frozen`, `unicorn`, `minecraft`).
- Přehled rodiče (Dashboard): karta **Rodinný cíl** (progress bar), karta **Odměny k předání** (APPROVED, nedoručené) s tlačítkem „Předáno“, a **Žádosti o odměny** (REQUESTED) se Schválit/Zamítnout.
- `Children.jsx`: ruční úprava bodů přejmenovat na „Oprava bodů“ s vysvětlivkou „Neslouží jako trest, XP se nemění“.
- Všechny nové texty v UI česky.

## 5. Testy (JUnit 5 + Mockito, jako stávající `*ServiceTest`)

- `ProgressServiceTest`
  - balance zahrnuje `REDEEM` i `MANUAL`, XP je nezahrnuje
  - level: 599 XP → lvl 2, 600 → lvl 3, 6000+ → max a `nextThreshold == null`; dítě 4 roky má poloviční prahy
  - streak: souvislých 5 dní → 5; jeden vynechaný den v týdnu → série pokračuje; dva vynechané ve stejném týdnu → přerušeno; vynechaný den v každém ze dvou různých týdnů → pokračuje
  - truhla: 3 úkoly v jednom dni → dostupná; po otevření v týdnu → nedostupná
- `TaskApprovalServiceTest`
  - schválení vytvoří `TASK`, s bonusem i `BONUS`
  - druhé schválení → výjimka, žádná nová transakce
  - 10. dokončené `WOOD` → odznak `LUMBERJACK` v `newBadges`
  - dosažení prahu → `levelUp = true`
- `RewardRedemptionServiceTest`: nedostatek bodů → 400; nejsou započítány `REQUESTED` žádosti; schválení vytvoří zápornou `REDEEM` transakci; `cancel` z `APPROVED` → 400.

## 6. Fáze

1. **Migrace V8 + entity + enumy + DTO**, aplikace startuje (`validate` projde).
2. **Schvalování na backendu** (`approve`/`reject`/`submit`) + úprava frontendu, ať už body nepřipisuje sám. *Tím se opraví dvojí připisování.*
3. **ProgressService + `/progress`** + úrovně v UI dítěte.
4. **Odměny a nákup** (redemption flow) + přehled rodiče.
5. **Série, odznaky, truhla, rodinný cíl.**
6. Seed / úprava existujících odměn podle doporučených cen (ručně v UI, ne migrací).

## 7. Hotovo, když

- [ ] Body nelze za jeden úkol připsat dvakrát (ani přes cyklus stavů).
- [ ] Nákup odměny sníží body, ale ne XP ani úroveň.
- [ ] Dítě vidí úroveň s názvem podle svého tématu a progress k další.
- [ ] Rodič u domácího úkolu může přidat bonus Detektiv chyb.
- [ ] Série přežije jeden vynechaný den v týdnu.
- [ ] Rodič vidí žádosti o odměny i nepředané odměny.
- [ ] `./mvnw test` a `npm run build` projdou.
