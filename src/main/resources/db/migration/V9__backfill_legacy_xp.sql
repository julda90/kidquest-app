-- Positive MANUAL transactions created before the points system was deployed
-- had no type set and don't count toward XP. Reclassify them as TASK so
-- children with historical points see a correct XP total and level.
UPDATE point_transaction
SET type = 'TASK'
WHERE type = 'MANUAL'
  AND amount > 0
  AND task_id IS NULL
  AND created_at < (SELECT installed_on FROM flyway_schema_history
                    WHERE description = 'points system'
                    ORDER BY installed_rank
                    LIMIT 1);
