-- catalog_key na task a reward
ALTER TABLE task ADD COLUMN catalog_key VARCHAR(50);
ALTER TABLE reward ADD COLUMN catalog_key VARCHAR(50);
ALTER TABLE reward ADD COLUMN archived_at TIMESTAMP;

-- partial unique indexy: (family_id, catalog_key) WHERE catalog_key IS NOT NULL
CREATE UNIQUE INDEX ux_task_family_catalog ON task(family_id, catalog_key) WHERE catalog_key IS NOT NULL;
CREATE UNIQUE INDEX ux_reward_family_catalog ON reward(family_id, catalog_key) WHERE catalog_key IS NOT NULL;
