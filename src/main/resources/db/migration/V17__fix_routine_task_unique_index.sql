-- The old index did not exclude soft-deleted tasks, so a deleted routine task
-- blocked creation of a fresh one and was still returned by the un-scoped query.
DROP INDEX IF EXISTS ux_task_routine_day;
CREATE UNIQUE INDEX ux_task_routine_day
    ON task(routine_id, child_id, due_date)
    WHERE routine_id IS NOT NULL AND deleted_at IS NULL;
