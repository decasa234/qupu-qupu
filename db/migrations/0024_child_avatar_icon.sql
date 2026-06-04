-- Per-child avatar icon (a cute-animal Font Awesome / vector slug), chosen from
-- the Profil page. Complements the existing avatar_color. Nullable — children
-- without one fall back to a default avatar in the UI.

BEGIN;

ALTER TABLE children ADD COLUMN IF NOT EXISTS avatar_icon VARCHAR(40);

COMMIT;
