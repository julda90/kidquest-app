-- Optional team-effort tasks: each participating child earns the base value plus a team bonus.
ALTER TABLE task ADD COLUMN team_effort BOOLEAN NOT NULL DEFAULT FALSE;
