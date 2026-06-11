-- 0045_parent_pin.sql
--
-- Parent PIN (kid-proofing the parent area). The parent's logged-in session
-- is shared with the kid; a 4-digit PIN gates the parent-only sections of
-- the Me/Profil page. Stored as a bcrypt hash (same cost as passwords) and
-- never returned by the API — only the derived `pinSet` boolean is exposed.
-- NULL = no PIN set yet (the member app prompts once per browser session).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS parent_pin_hash VARCHAR(255);
