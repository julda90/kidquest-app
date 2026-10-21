-- druh úkolu a bonus
ALTER TABLE task ADD COLUMN kind VARCHAR(30) NOT NULL DEFAULT 'OTHER';
ALTER TABLE task ADD COLUMN bonus_value INTEGER NOT NULL DEFAULT 0;
ALTER TABLE task ADD COLUMN approved_at TIMESTAMP;

-- typ transakce + vazba na úkol kvůli idempotenci
ALTER TABLE point_transaction ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'MANUAL';
ALTER TABLE point_transaction ADD COLUMN task_id UUID REFERENCES task(id);
ALTER TABLE point_transaction ADD COLUMN redemption_id UUID;
CREATE UNIQUE INDEX ux_point_tx_task_type ON point_transaction(task_id, type) WHERE task_id IS NOT NULL;
CREATE INDEX ix_point_tx_child_created ON point_transaction(child_id, created_at);

-- odměny
ALTER TABLE reward ADD COLUMN tier VARCHAR(20) NOT NULL DEFAULT 'SMALL';
ALTER TABLE reward ADD COLUMN icon VARCHAR(16);
ALTER TABLE reward ADD COLUMN child_id UUID REFERENCES child(id);

CREATE TABLE reward_redemption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID NOT NULL REFERENCES reward(id),
    child_id UUID NOT NULL REFERENCES child(id),
    point_cost INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);
ALTER TABLE point_transaction
    ADD CONSTRAINT fk_point_tx_redemption FOREIGN KEY (redemption_id) REFERENCES reward_redemption(id);

CREATE TABLE child_badge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child(id),
    badge VARCHAR(30) NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (child_id, badge)
);

CREATE TABLE family_goal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id),
    name VARCHAR(200) NOT NULL,
    target_points INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reached_at TIMESTAMP,
    cancelled_at TIMESTAMP
);
