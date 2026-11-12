-- Evening routines: a child may have a morning and an evening routine.
-- Existing routines are morning by default.
ALTER TABLE routine ADD COLUMN part VARCHAR(10) NOT NULL DEFAULT 'MORNING';
