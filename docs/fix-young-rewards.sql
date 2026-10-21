-- Přiřadí odměny pro nejmladší dítě (do 6 let = Rebeka) a nastaví jim tier a cenu.
-- Párování přes catalog_key z importu katalogu. Bezpečné spustit opakovaně.
BEGIN;

UPDATE reward r SET tier = v.tier, point_cost = v.cost,
       child_id = (SELECT c.id FROM child c
                   WHERE c.family_id = r.family_id AND c.deleted_at IS NULL
                     AND c.age < 6
                   ORDER BY c.age LIMIT 1)
FROM (VALUES
  ('y_sticker','SMALL',30), ('y_lollipop','SMALL',40), ('y_story','SMALL',50),
  ('y_crayons','MEDIUM',150), ('y_baking','MEDIUM',150), ('y_plush','BIG',400)
) AS v(key, tier, cost)
WHERE r.catalog_key = v.key;

-- kontrola: všech 6 řádků musí mít dítě Rebeka
SELECT r.name, r.tier, r.point_cost, c.name AS pro_dite, c.age
FROM reward r LEFT JOIN child c ON c.id = r.child_id
WHERE r.catalog_key LIKE 'y\_%'
ORDER BY r.point_cost;

COMMIT;
