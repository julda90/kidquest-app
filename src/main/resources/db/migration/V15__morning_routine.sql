CREATE TABLE routine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id),
    child_id UUID NOT NULL REFERENCES child(id),
    name VARCHAR(100) NOT NULL DEFAULT 'Ranní rutina',
    deadline TIME NOT NULL DEFAULT '07:30',
    days_of_week VARCHAR(20) NOT NULL DEFAULT '1,2,3,4,5',
    point_value INTEGER NOT NULL DEFAULT 10,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE routine_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES routine(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    label VARCHAR(40) NOT NULL,
    icon VARCHAR(16) NOT NULL
);

CREATE TABLE task_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    label VARCHAR(40) NOT NULL,
    icon VARCHAR(16) NOT NULL,
    done_at TIMESTAMP,
    returned BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE task ADD COLUMN routine_id UUID REFERENCES routine(id);
ALTER TABLE task ADD COLUMN submitted_at TIMESTAMP;
ALTER TABLE task ADD COLUMN first_submitted_on_time BOOLEAN;

CREATE UNIQUE INDEX ux_task_routine_day ON task(routine_id, child_id, due_date)
    WHERE routine_id IS NOT NULL;
