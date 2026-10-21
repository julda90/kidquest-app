# KidQuest – ranní rutina se schválením rodičem

Dítě odklikává kroky samo. Po posledním kroku odešle celou rutinu ke schválení a rodič ji schválí nebo vrátí. **Body jsou jen za rutinu odeslanou včas.** Po termínu se odeslat nedá a ten den je bez bodů. Bez notifikací: žádosti se ukazují v seznamu „Čeká na schválení“ na přehledu rodiče.

Navazuje na `points-system-spec.md` (submit / approve, série, odznaky) a `kid-tabs-spec.md` (záložka Výzvy). Všechny texty v UI česky.

---

## 1. Pravidla

| | děti 6+ | děti do 6 let |
|---|---|---|
| kroky (výchozí) | Vstát · Zuby · Obléct · Snídaně · Batoh | Vstát · Zoubky · Obléct · Snídaňka |
| termín (výchozí) | 7:30 | 7:45 |
| dny (výchozí) | Po–Pá | Po–Pá |
| body při odeslání včas | **10** | **5** |
| odesláno po termínu | nelze, 0 bodů | nelze, 0 bodů |

- **Včas = okamžik odeslání** (`submitted_at`) ≤ termín. Čas schválení nehraje roli, rodič může schvalovat třeba až večer.
- Odeslat jde jen **kompletní** rutinu (všechny kroky odškrtnuté).
- Po termínu se karta rutiny uzamkne a nejde odeslat.
- **Vrácení rodičem:** rodič označí kroky, které neseděly. Ty se dítěti odškrtnou a rutina jde znovu do stavu rozpracovaná. Pokud bylo **první odeslání včas**, opravené odeslání se počítá jako včas i po termínu. Zdržení kontrolou není chyba dítěte. Pro opravu platí limit do 23:59 téhož dne.
- Nezaslaná nebo pozdní rutina sérii nepřeruší sama o sobě. Série se počítá podle aktivních dnů (jakýkoli `TASK`), takže stačí jiný splněný úkol ten den.
- Den se do série počítá podle **dne odeslání**: `TASK` transakce rutiny dostane `created_at` = schválení, ale pro výpočet série se použije `task.due_date`. Uprav `ProgressService.streak`, aby bral den z `task.due_date`, když je transakce navázaná na úkol.
- Čas vždy podle serveru v `Europe/Prague` (injektovaný `Clock`), nikdy podle zařízení dítěte.

## 2. Databáze (migrace, další volné číslo)

```sql
CREATE TABLE routine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id),
    child_id UUID NOT NULL REFERENCES child(id),
    name VARCHAR(100) NOT NULL DEFAULT 'Ranní rutina',
    deadline TIME NOT NULL DEFAULT '07:30',
    days_of_week VARCHAR(20) NOT NULL DEFAULT '1,2,3,4,5',   -- ISO: 1 = pondělí
    point_value INTEGER NOT NULL DEFAULT 10,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE routine_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES routine(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    label VARCHAR(40) NOT NULL,
    icon VARCHAR(16) NOT NULL
);

-- denní instance = běžný task (kind = ROUTINE), kroky instance:
CREATE TABLE task_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    label VARCHAR(40) NOT NULL,
    icon VARCHAR(16) NOT NULL,
    done_at TIMESTAMP,
    returned BOOLEAN NOT NULL DEFAULT FALSE      -- rodič vrátil tento krok
);

ALTER TABLE task ADD COLUMN routine_id UUID REFERENCES routine(id);
ALTER TABLE task ADD COLUMN submitted_at TIMESTAMP;
ALTER TABLE task ADD COLUMN first_submitted_on_time BOOLEAN;
CREATE UNIQUE INDEX ux_task_routine_day ON task(routine_id, child_id, due_date)
    WHERE routine_id IS NOT NULL;
```

`TaskKind` doplnit o `ROUTINE`.

## 3. Backend

### 3.1 Denní instance (lazy)
`RoutineService.getOrCreateToday(childId)`, volané z `GET /api/children/{childId}/today`:
- Najde aktivní `routine` dítěte, jejíž `days_of_week` obsahuje dnešní den.
- Pokud pro dnešek neexistuje `task` s `routine_id`, vytvoří ho: `kind = ROUTINE`, `title = routine.name`, `pointValue = routine.point_value`, `assignedTo = child`, `status = ASSIGNED`, `due_date = dnes`, a zkopíruje kroky do `task_step` (snapshot, pozdější změna šablony neovlivní dnešek).
- Souběžné volání ošetřit unikátním indexem (catch `DataIntegrityViolationException` → načíst existující).
- Vrátí rutinu ve tvaru `{ taskId, steps[], status, deadline, locked, onTimeEligible, pointValue, returnedSteps[] }`.
  - `locked = status in (ASSIGNED) && now > deadline && first_submitted_on_time IS NOT TRUE`

### 3.2 Endpointy
| metoda | cesta | role | popis |
|---|---|---|---|
| GET | `/api/children/{childId}/today` | CHILD/PARENT | rutina dne + dnešní úkoly (stávající obsah Výzev) |
| POST | `/api/tasks/{taskId}/steps/{position}/toggle` | CHILD/PARENT | odškrtne / zruší krok; 409, když je rutina odeslaná, schválená nebo `locked` |
| POST | `/api/tasks/{taskId}/submit` | CHILD/PARENT | u `ROUTINE` navíc kontrola níže |
| POST | `/api/tasks/{taskId}/approve` | PARENT | stávající; u `ROUTINE` bez dalších polí |
| POST | `/api/tasks/{taskId}/return` | PARENT | body `{ steps: [2, 4] }` – vrátí rutinu dítěti |
| POST | `/api/tasks/approve-batch` | PARENT | body `{ taskIds: [] }` – hromadné schválení |
| GET/POST/PUT | `/api/routines/...` | PARENT | správa šablon (kapitola 5) |

### 3.3 Submit u ROUTINE
1. Všechny `task_step.done_at` musí být vyplněné, jinak 400 „Ještě nemáš všechno.“
2. `onTime = now ≤ due_date + deadline`.
3. Pokud `first_submitted_on_time IS NULL` (první odeslání):
   - `!onTime` → 400 „Dnes už je pozdě. Zítra to dáš! ⏰“ (nic se neukládá).
   - jinak `first_submitted_on_time = true`.
4. Pokud `first_submitted_on_time = true` (opakované odeslání po vrácení): povoleno až do konce dne.
5. `submitted_at = now`, `status = PENDING_APPROVAL`, `returned = false` u všech kroků.

### 3.4 Approve u ROUTINE
Stávající `TaskApprovalService.approve`: `TASK` transakce ve výši `pointValue` (`first_submitted_on_time` je u odeslané rutiny vždy `true`, takže body jdou vždy plné). Série a odznaky jako u ostatních úkolů.

Odznak `EARLY_BIRD` (Ranní ptáče): 10 schválených úkolů `ROUTINE`.

### 3.5 Return
- Jen ze stavu `PENDING_APPROVAL`.
- U zadaných kroků `done_at = NULL`, `returned = true`. `status = ASSIGNED`. `first_submitted_on_time` se nemění.

### 3.6 Úklid
Rutina, která zůstala `ASSIGNED` (neodeslaná) nebo `PENDING_APPROVAL` do půlnoci:
- `ASSIGNED` → nechat být, druhý den se vytvoří nová instance. V dětském UI se staré nezobrazují (filtr `due_date = dnes`).
- `PENDING_APPROVAL` z minulých dnů zůstává rodiči ke schválení. Body se připíšou, protože odeslání bylo včas. Rodič je vidí se štítkem data („včera“).

## 4. Frontend – dítě (záložka Výzvy)

Karta rutiny nahoře (stávající pruh kroků):
- Odkliknutí kroku → `toggle`, okamžitá animace odškrtnutí (optimistic update, při chybě vrátit).
- Pod kroky stav:
  - rozpracovaná: „Do 7:30 · zbývá 22 min“ (odpočet jen orientační, rozhoduje server)
  - vše odškrtnuté: tlačítko **„Hotovo, ukaž tátovi/mámě! ☀️“**
  - odesláno: „Čeká na tátu/mámu ✋“, kroky už nejdou měnit
  - vráceno: vrácené kroky zvýrazněné (červený okraj), text „Ještě zkontroluj: 🪥 Zuby“
  - schváleno: „+10 ☀️ Ranní rutina splněná!“ + krátká oslava podle tématu
  - po termínu bez odeslání: karta zašedlá, „Dnes už je pozdě. Zítra to dáš! ⏰“, kroky nejdou klikat
- Žádná rutina dnes (víkend): karta se nezobrazí.

## 5. Frontend – rodič

### 5.1 Přehled (Dashboard)
V seznamu „Čeká na schválení“ karta rutiny:
```
☀️ Ranní rutina · Samuel          odesláno 7:08 · +10
🌅 🪥 👕 🥣 🎒
[Schválit]  [Vrátit…]
```
- „Vrátit…“ rozbalí kroky jako zaškrtávátka → „Vrátit vybrané“.
- Nad seznamem tlačítko **„Schválit všechny rutiny (3)“**, když čeká víc rutin → `approve-batch`. Potvrzení přímo v tlačítku (druhý klik), ne `window.confirm`.
- Bez notifikací a bez pollingu: seznam se načte při otevření a obnovení stránky.

### 5.2 Nastavení rutin
Nová sekce v Nastavení „Ranní rutiny“, jedna karta na dítě:
- přepínač aktivní, termín (time input), dny v týdnu (7 chipů), body
- kroky: seznam s ikonou (výběr emoji) a názvem, přidat / smazat / přesunout šipkami nahoru a dolů, max. 8 kroků
- tlačítko „Vytvořit rutinu“ pro dítě bez rutiny předvyplní výchozí kroky podle věku (kapitola 1)

## 6. Testy
- submit 7:29 → `PENDING_APPROVAL`, `first_submitted_on_time = true`
- submit 7:31 bez předchozího odeslání → 400, nic se neuloží
- submit s neodškrtnutým krokem → 400
- odeslání 7:20, vrácení 7:40, nové odeslání 7:45 → povoleno; approve připíše plné body
- toggle po termínu bez odeslání → 409
- approve → `TASK` 10; druhé approve → 409
- `getOrCreateToday` dvakrát souběžně → jedna instance
- víkend s `days_of_week = 1..5` → žádná instance
- série: rutina odeslaná v pondělí, schválená v úterý → aktivní den je pondělí
- 10 schválených rutin → odznak `EARLY_BIRD`

## 7. Hotovo, když
- [ ] Dítě odklikává kroky samo a rodič schvaluje jen jednou za celou rutinu.
- [ ] Po termínu rutinu nejde odeslat a dítě vidí proč.
- [ ] Rodič může vrátit konkrétní kroky a dítě je vidí zvýrazněné.
- [ ] Vrácení po včasném odeslání nepřipraví dítě o body.
- [ ] Rodič schválí všechny rutiny jedním tlačítkem, klidně až večer.
- [ ] Rebeka má vlastní kratší rutinu za 5 bodů.
- [ ] `./mvnw test` a `npm run build` projdou.
