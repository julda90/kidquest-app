# KidQuest – nové tiery a přecenění odměn

Problém: doporučené ceny tierů v kódu (50 / 150 / 300 / 600) pocházejí ze staré ekonomiky (ruční body po 1–15). S novými úkoly (10–40 bodů, realisticky 60–80 bodů za den u dítěte 6+) jsou malé odměny za pár hodin a varování svítí u 13 odměn. Z odměn pro Rebeku je jí přiřazená jen Samolepka. Ostatní vidí i dvojčata, takže si mohou koupit plyšáka za 300.

## 1. Tiery jako rozsahy podle věku (kód)

Nahraď jednu „doporučenou cenu“ rozsahem. Varování zobrazuj jen mimo rozsah. Pro odměny s `child_id` dítěte mladšího 6 let použij rozsahy YOUNG.

```js
// frontend/src/constants/rewardTiers.js
export const TIER_RANGES = {
  STANDARD: {            // děti 6+ (~70 bodů/den)
    SMALL:  { min: 100,  max: 200,  label: 'Malá',    hint: '1–3 dny práce' },
    MEDIUM: { min: 350,  max: 700,  label: 'Střední', hint: '1–2 týdny' },
    BIG:    { min: 1200, max: 2500, label: 'Velká',   hint: '3–5 týdnů' },
    MEGA:   { min: 3500, max: 6000, label: 'Mega',    hint: '2–3 měsíce' },
  },
  YOUNG: {               // děti do 6 let (~35 bodů/den)
    SMALL:  { min: 30,   max: 60,   label: 'Malá',    hint: '1–2 dny' },
    MEDIUM: { min: 100,  max: 200,  label: 'Střední', hint: 'asi týden' },
    BIG:    { min: 300,  max: 500,  label: 'Velká',   hint: '2–3 týdny' },
    MEGA:   { min: 800,  max: 1200, label: 'Mega',    hint: 'měsíc' },
  },
}
```

- Záhlaví skupiny: „Malé · 100–200 bodů · 1–3 dny práce“ místo „doporučená cena: 50 bodů“.
- Funkce `rangeFor(reward, children)`: když `reward.childId` patří dítěti s `age < 6` → `YOUNG`, jinak `STANDARD`.
- Stejné rozsahy použij ve formuláři odměny (předvyplnění ceny = střed rozsahu) a v backendu, pokud tam validace tieru existuje (sjednotit do jednoho zdroje, např. `GET /api/rewards/tiers`).
- Volitelně nové pole `reward.weekly_limit INTEGER NULL`: kolikrát za týden si dítě odměnu může koupit. V obchodě se po vyčerpání ukáže „Znovu od pondělí“.

## 2. Nové ceny

### Odměny pro děti 6+ (`child_id = NULL`)
| odměna | tier teď | cena teď | **tier** | **cena** | limit/týden |
|---|---|---|---|---|---|
| Vybrat dezert k večeři | Střední | 100 | **Malá** | **100** | – |
| Zmrzlina | Malá | 70 | Malá | **120** | – |
| Dobrůtka z obchodu | Střední | 150 | **Malá** | **120** | – |
| 30 min hraní / tabletu navíc | Malá | 200 | Malá | **200** | 1 |
| Večerka o 30 min později | Střední | 400 | Střední | **350** | 1 |
| Odpoledne s tátou v dílně | Střední | 500 | Střední | **400** | – |
| Vybrat večeři pro celou rodinu | Střední | 400 | Střední | **450** | – |
| Táborák s buřty | Střední | 600 | Střední | **500** | – |
| Filmový večer s popcornem | Střední | 450 | Střední | **600** | 1 |
| Odpoledne na lezecké stěně | Střední | 600 | Střední | **700** | – |
| Nová kniha | Velká | 1 500 | Velká | **1 200** | – |
| Puzzle / stolní hra | Velká | 1 500 | Velká | **1 500** | – |
| Hodina v jumpparku | Mega | 1 500 | **Velká** | **1 800** | – |
| Přespání venku ve stanu | Mega | 4 000 | Mega | **3 500** | – |
| LEGO stavebnice | Mega | 2 500 | Mega | **4 000** | – |
| Výlet podle mého výběru | Mega | 4 000 | Mega | **5 000** | – |

### Odměny pro Rebeku (`child_id = Rebeka`)
| odměna | **tier** | **cena** |
|---|---|---|
| Samolepka | Malá | **30** |
| Lízátko | Malá | **40** |
| Pohádka navíc před spaním | Malá | **50** |
| Pastelky | Střední | **150** |
| Péct s mámou | Střední | **150** |
| Plyšák | Velká | **400** |

Výsledné rozložení pro děti 6+: 4 malé, 6 středních, 3 velké, 3 mega. Dítě má vždy něco na dosah do 2 dnů, něco na týden a jeden velký cíl.

## 3. Jednorázový SQL skript (spustit ručně, není to Flyway migrace)

Ceny jsou specifické pro tuto rodinu, proto nepatří do migrací. Skript páruje přes `catalog_key` (odměny vznikly importem katalogu). Pokud nějaký `catalog_key` chybí, uprav ručně v UI.

```sql
BEGIN;

-- děti 6+
UPDATE reward r SET tier = v.tier, point_cost = v.cost, child_id = NULL
FROM (VALUES
  ('r_dessert','SMALL',100), ('r_icecream','SMALL',120), ('r_treat','SMALL',120),
  ('r_screen30','SMALL',200), ('r_late_bed','MEDIUM',350), ('r_dad_workshop','MEDIUM',400),
  ('r_dinner_pick','MEDIUM',450), ('r_campfire','MEDIUM',500), ('r_movie','MEDIUM',600),
  ('r_climbing','MEDIUM',700), ('r_book','BIG',1200), ('r_puzzle','BIG',1500),
  ('r_jumppark','BIG',1800), ('r_sleepover','MEGA',3500), ('r_lego','MEGA',4000),
  ('r_trip','MEGA',5000)
) AS v(key, tier, cost)
WHERE r.catalog_key = v.key;

-- Rebeka (nejmladší dítě, do 6 let)
UPDATE reward r SET tier = v.tier, point_cost = v.cost,
       child_id = (SELECT c.id FROM child c
                   WHERE c.family_id = r.family_id AND c.deleted_at IS NULL
                     AND c.age < 6 ORDER BY c.age LIMIT 1)
FROM (VALUES
  ('y_sticker','SMALL',30), ('y_lollipop','SMALL',40), ('y_story','SMALL',50),
  ('y_crayons','MEDIUM',150), ('y_baking','MEDIUM',150), ('y_plush','BIG',400)
) AS v(key, tier, cost)
WHERE r.catalog_key = v.key;

-- kontrola: nic by nemělo zůstat bez dítěte u y_* klíčů
SELECT name, tier, point_cost, child_id FROM reward
WHERE catalog_key LIKE 'y\_%' AND child_id IS NULL;

COMMIT;
```

Pokud je zapnuté `weekly_limit`:
```sql
UPDATE reward SET weekly_limit = 1
WHERE catalog_key IN ('r_screen30','r_late_bed','r_movie');
```

## 4. Hotovo, když
- [ ] Banner s varováním ukazuje 0 odměn.
- [ ] Záhlaví tierů ukazují rozsah a počet dní práce, ne jednu cenu.
- [ ] Odměny pro Rebeku vidí v obchodě jen ona a hodnotí se podle rozsahů YOUNG.
- [ ] Samolepka je přiřazená Sáře, ne Rebece.
- [ ] Film a hraní jdou koupit nejvýš 1× týdně (pokud je `weekly_limit` implementovaný).
