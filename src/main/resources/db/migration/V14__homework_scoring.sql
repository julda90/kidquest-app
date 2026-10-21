ALTER TABLE task ADD COLUMN late_point_value INTEGER;
ALTER TABLE task ADD COLUMN no_reminder_bonus INTEGER NOT NULL DEFAULT 0;
ALTER TABLE point_transaction ADD COLUMN bonus_kind VARCHAR(20);
DROP INDEX IF EXISTS ux_point_tx_task_type;
CREATE UNIQUE INDEX ux_point_tx_task_type_bonus
    ON point_transaction(task_id, type, COALESCE(bonus_kind, ''))
    WHERE task_id IS NOT NULL;
