BEGIN;

DELETE FROM point_transaction;
DELETE FROM reward_redemption;
DELETE FROM child_badge;

UPDATE family_goal SET cancelled_at = NOW()
WHERE reached_at IS NULL AND cancelled_at IS NULL;

UPDATE task SET deleted_at = NOW()
WHERE deleted_at IS NULL AND status IN ('COMPLETED', 'REJECTED');

UPDATE task SET status = 'ASSIGNED'
WHERE deleted_at IS NULL AND status = 'PENDING_APPROVAL';

SELECT 'transakce'     AS co, COUNT(*) FROM point_transaction
UNION ALL SELECT 'nákupy',    COUNT(*) FROM reward_redemption
UNION ALL SELECT 'odznaky',   COUNT(*) FROM child_badge
UNION ALL SELECT 'aktivní úkoly', COUNT(*) FROM task WHERE deleted_at IS NULL;

COMMIT;
