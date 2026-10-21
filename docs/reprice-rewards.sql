-- KidQuest – jednorázové přecenění odměn na novou ekonomiku
-- Spustit ručně v databázi. NENÍ to Flyway migrace.
-- Páruje přes catalog_key (odměny musí být naimportované z katalogu).

BEGIN;

-- Odměny pro děti 6+ (child_id = NULL)
UPDATE reward r
SET tier       = v.tier,
    point_cost = v.cost,
    child_id   = NULL
FROM (VALUES
  ('r_dessert',      'SMALL',  100),
  ('r_icecream',     'SMALL',  120),
  ('r_treat',        'SMALL',  120),
  ('r_screen30',     'SMALL',  200),
  ('r_late_bed',     'MEDIUM', 350),
  ('r_dad_workshop', 'MEDIUM', 400),
  ('r_dinner_pick',  'MEDIUM', 450),
  ('r_campfire',     'MEDIUM', 500),
  ('r_movie',        'MEDIUM', 600),
  ('r_climbing',     'MEDIUM', 700),
  ('r_book',         'BIG',    1200),
  ('r_puzzle',       'BIG',    1500),
  ('r_jumppark',     'BIG',    1800),
  ('r_sleepover',    'MEGA',   3500),
  ('r_lego',         'MEGA',   4000),
  ('r_trip',         'MEGA',   5000)
) AS v(key, tier, cost)
WHERE r.catalog_key = v.key;

-- Odměny pro Sáru (přiřadit child_id = Sářino id)
UPDATE reward r
SET tier       = v.tier,
    point_cost = v.cost,
    child_id   = (
        SELECT c.id FROM child c
        WHERE c.family_id = r.family_id
          AND c.deleted_at IS NULL
          AND c.name ILIKE 'S_ra'
        LIMIT 1
    )
FROM (VALUES
  ('y_sticker',  'SMALL',  30),
  ('y_lollipop', 'SMALL',  40),
  ('y_story',    'SMALL',  50),
  ('y_crayons',  'MEDIUM', 150),
  ('y_baking',   'MEDIUM', 150),
  ('y_plush',    'BIG',    400)
) AS v(key, tier, cost)
WHERE r.catalog_key = v.key;

-- Týdenní limit pro screen time, pozdní večerku a filmový večer
UPDATE reward
SET weekly_limit = 1
WHERE catalog_key IN ('r_screen30', 'r_late_bed', 'r_movie');

-- Kontrola: žádná y_* odměna by neměla mít child_id = NULL
SELECT name, tier, point_cost, child_id
FROM reward
WHERE catalog_key LIKE 'y\_%' ESCAPE '\'
  AND child_id IS NULL;

COMMIT;
