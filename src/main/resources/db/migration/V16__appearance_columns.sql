ALTER TABLE child ADD COLUMN selected_avatar_level INTEGER;
ALTER TABLE child ADD COLUMN selected_landscape_level INTEGER;
ALTER TABLE child DROP COLUMN IF EXISTS selected_skin;
