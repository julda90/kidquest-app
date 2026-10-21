# KidQuest – bodování domácích úkolů + čistý start

Dvě části:
1. Nové bodování domácího úkolu (včas / později, Detektiv chyb, bez připomínání).
2. Jednorázový reset: všem dětem vynulovat body, XP, série, odznaky a historii. Od nasazení se začíná od nuly.

Pořadí: nejdřív nasadit část 1, pak spustit reset z části 2, aby první body nového období už vznikly podle nových pravidel.

---

## 1. Bodování domácího úkolu

### 1.1 Pravidla
| část | body | typ transakce | podmínka |
|---|---|---|---|
| Hotovo včas | 20 | `TASK` | do dohodnutého času (před hraním / do 17:00) |
| Hotovo později | 10 | `TASK` | týž den po termínu |
| 🔍 Detektiv chyb | +15 | `BONUS` | dítě si úkol samo zkontrolovalo a chybu opravilo |
| Sám, bez připomínání | +5 | `BONUS` | sedl si k úkolu bez volání |

Maximum 40 bodů denně, stejně jako Štípat třísky. Body za „bez chyby“ záměrně nejsou: odměňujeme vlastní kontrolu, ne bezchybnost.

Čas se v kódu nehlídá. „Včas“ určuje rodič při schválení.

### 1.2 Backend
- `ApproveRequest`: nahraď `boolean bonus` třemi poli:
  ```java
  private boolean onTime = true;      // false → TASK = latePointValue
  private boolean selfChecked;        // Detektiv chyb
  private boolean noReminder;         // bez připomínání
  ```
- `Task`: nové sloupce (migrace, další volné číslo):
  ```sql
  ALTER TABLE task ADD COLUMN late_point_value INTEGER;           -- NULL = stejně jako point_value
  ALTER TABLE task ADD COLUMN no_reminder_bonus INTEGER NOT NULL DEFAULT 0;
  ```
  `bonus_value` zůstává pro Detektiva chyb.
- Výchozí hodnoty pro `TaskKind.HOMEWORK` (formulář, katalog `homework`): `pointValue 20`, `latePointValue 10`, `bonusValue 15`, `noReminderBonus 5`.
- `TaskApprovalService.approve`:
  1. `TASK` = `onTime ? pointValue : coalesce(latePointValue, pointValue)`, `reason = title` (+ „ (později)“, když `!onTime`).
  2. `selfChecked && bonusValue > 0` → `BONUS`, `reason = "Detektiv chyb: " + title`.
  3. `noReminder && noReminderBonus > 0` → `BONUS`, `reason = "Bez připomínání: " + title`.
- **Idempotence:** současný unique index `(task_id, type)` by druhý `BONUS` zablokoval. Přidej sloupec `point_transaction.bonus_kind VARCHAR(20)` (`SELF_CHECK`, `NO_REMINDER`, NULL u ostatních) a index nahraď:
  ```sql
  DROP INDEX ux_point_tx_task_type;
  CREATE UNIQUE INDEX ux_point_tx_task_type_bonus
      ON point_transaction(task_id, type, COALESCE(bonus_kind, ''))
      WHERE task_id IS NOT NULL;
  ```
- Odznak `SHERLOCK` počítá jen `BONUS` s `bonus_kind = 'SELF_CHECK'`.
- Nový odznak `SELF_STARTER` (Samostatný): 10× `NO_REMINDER`.
- Zpětná kompatibilita: pokud frontend pošle staré `{ "bonus": true }`, mapuj na `selfChecked = true` (`@JsonAlias` nebo setter), ať se nic nerozbije během nasazení.

### 1.3 Frontend
- Dialog schválení u úkolu typu `HOMEWORK` (Dashboard i Úkoly), přímo v kartě nebo malém modalu:
  ```
  📝 Domácí úkol – Samuel
  [✓] Včas                         20  (jinak 10)
  [ ] 🔍 Sám zkontroloval a opravil +15
  [ ] Sám, bez připomínání          +5
  ─────────────────────────────────────
  Celkem: 20 bodů        [Schválit] [Zamítnout]
  ```
  Součet se přepočítává živě.
- Ostatní druhy úkolů se schvalují jedním klikem jako dosud.
- `TaskForm.jsx` u `HOMEWORK`: pole „Body včas“, „Body později“, „Bonus Detektiv chyb“, „Bonus bez připomínání“.
- Dětský pohled, karta domácího úkolu: „📝 Domácí úkol · 20 + 🔍15 + 5“ a pod tím malým písmem „Udělej ho včas, zkontroluj a oprav sám.“
- Deník (Já): `BONUS` řádky s textem podle `bonus_kind`.

### 1.4 Testy
- včas + oba bonusy → 3 transakce, součet 40
- později bez bonusů → 1 transakce, 10
- druhé schválení → 409, žádné nové transakce
- 10× `SELF_CHECK` → `SHERLOCK`, 10× `NO_REMINDER` → `SELF_STARTER`, a navzájem se nezapočítávají

---

## 2. Čistý start (reset bodů)

### 2.1 Co se resetuje a co zůstává
| resetuje se | zůstává |
|---|---|
| všechny transakce (body i XP → 0, úroveň 1) | děti, rodiny, účty |
| série (počítá se z transakcí) | odměny a jejich ceny |
| odznaky (`child_badge`) | otevřené úkoly (`UNASSIGNED`, `ASSIGNED`) a vedlejší questy (šablony) |
| žádosti o odměny (`reward_redemption`) | |
| rodinný cíl (zruší se, rodič založí nový) | |
| dokončené a zamítnuté úkoly (soft delete, aby se znovu nezapočítaly do odznaků) | |
| čekající úkoly (`PENDING_APPROVAL`) se vrátí do `ASSIGNED` | |

**Než reset spustíš:** předej dětem odměny, které jsou schválené a nepředané. Reset je smaže a děti by o ně přišly.

### 2.2 Záloha (povinná)
Produkce běží v k3s v namespace `kidquest`.

```bash
kubectl -n kidquest get pods | grep -i postgres
```
Vypíše pody v namespace `kidquest` a vyfiltruje ten s Postgresem. Jeho jméno dosaď níž místo `<postgres-pod>`.

```bash
kubectl -n kidquest exec <postgres-pod> -- pg_dump -U kidquest -d kidquest -Fc > kidquest-before-reset-$(date +%F).dump
```
Spustí `pg_dump` uvnitř podu a celou databázi uloží v komprimovaném formátu (`-Fc`) do lokálního souboru s dnešním datem. Z něj jde případně vše obnovit přes `pg_restore`.

```bash
ls -lh kidquest-before-reset-*.dump
```
Ověří, že soubor vznikl a není prázdný (měl by mít aspoň desítky kB).

Pokud běží lokálně přes docker compose, místo `kubectl -n kidquest exec <postgres-pod>` použij `docker compose exec -T postgres`.

### 2.3 Reset skript
Uložit jako `scripts/fresh-start.sql` (ne do `db/migration`: je to jednorázová akce nad daty, ne změna schématu). Celé běží v transakci a na konci vypíše kontrolní součty.

```sql
BEGIN;

-- 1) kniha bodů (body, XP, série, truhly)
DELETE FROM point_transaction;

-- 2) nákupy odměn
DELETE FROM reward_redemption;

-- 3) odznaky
DELETE FROM child_badge;

-- 4) rodinné cíle – zrušit aktivní
UPDATE family_goal SET cancelled_at = NOW()
WHERE reached_at IS NULL AND cancelled_at IS NULL;

-- 5) historické úkoly pryč z počítání odznaků a statistik
UPDATE task SET deleted_at = NOW()
WHERE deleted_at IS NULL AND status IN ('COMPLETED', 'REJECTED');

-- 6) čekající úkoly zpět ke splnění
UPDATE task SET status = 'ASSIGNED'
WHERE deleted_at IS NULL AND status = 'PENDING_APPROVAL';

-- kontrola
SELECT 'transakce' AS co, COUNT(*) FROM point_transaction
UNION ALL SELECT 'nákupy', COUNT(*) FROM reward_redemption
UNION ALL SELECT 'odznaky', COUNT(*) FROM child_badge
UNION ALL SELECT 'aktivní úkoly', COUNT(*) FROM task WHERE deleted_at IS NULL;

COMMIT;
```

Upozornění: pokud by `task` měl FK z jiných tabulek s `ON DELETE`, nevadí, úkoly se jen soft-deletují. Pokud nějaká tabulka z kroků 1–3 v DB ještě neexistuje (fáze nebyla nasazená), daný řádek ze skriptu vynech.

```bash
kubectl -n kidquest exec -i <postgres-pod> -- psql -U kidquest -d kidquest -v ON_ERROR_STOP=1 < scripts/fresh-start.sql
```
Pošle skript na standardní vstup `psql` v podu. `ON_ERROR_STOP=1` zastaví běh při první chybě, takže transakce se nepotvrdí napůl.

```bash
kubectl -n kidquest exec -i <postgres-pod> -- psql -U kidquest -d kidquest -c "SELECT c.name, COALESCE(SUM(t.amount),0) AS body FROM child c LEFT JOIN point_transaction t ON t.child_id = c.id WHERE c.deleted_at IS NULL GROUP BY c.name;"
```
Vypíše zůstatek každého dítěte. Všechny musí mít 0.

### 2.4 Úklid ve frontendu
- Smazat uložený level v `localStorage` (klíč pro detekci level-upu z `kid-tabs-spec.md`), jinak by se po resetu nespustila animace prvního postupu nebo by aplikace hlásila pokles úrovně. Řešení bez ručního zásahu: ukládat `{ childId, level, seasonId }` a při `level < uloženého` jen přepsat bez animace.
- Pokud se banner přecenění odměn řídí počtem nákupů, po resetu se nesmí znovu objevit (`kq.repriceBannerDismissed` zůstává).

### 2.5 Volitelné: oznámení dětem
Při prvním otevření po resetu ukázat dítěti jednorázovou obrazovku (`localStorage` `kq.freshStartSeen.<childId>`):
„🌅 Nový začátek! Všichni začínáme od nuly. Nové úkoly, nové odměny, nové odznaky. Kdo získá první odznak?“
S tlačítkem „Jdu na to!“ → Výzvy.

### 2.6 Hotovo, když
- [ ] Před resetem existuje záloha `kidquest-before-reset-*.dump`.
- [ ] Všechny děti mají 0 bodů, 0 XP, úroveň 1, sérii 0 a žádné odznaky.
- [ ] Odměny a jejich ceny zůstaly beze změny.
- [ ] Otevřené úkoly a vedlejší questy jsou dál k dispozici.
- [ ] První schválený domácí úkol po resetu připíše body podle nových pravidel (část 1).
