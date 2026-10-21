ALTER TABLE task
    ADD COLUMN is_open_quest BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN template_id   UUID REFERENCES task(id),
    ADD COLUMN daily_limit   INTEGER NOT NULL DEFAULT 1;
