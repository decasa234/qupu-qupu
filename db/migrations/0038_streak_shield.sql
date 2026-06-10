-- 0038_streak_shield.sql — "Pelindung Streak" (Mythos P1.2)
--
-- A purchasable streak shield that auto-consumes when the kid misses a
-- day: if the child owns enough shields to cover every missed day, the
-- streak continues unbroken (streakUpdater.ts). Ownership lives directly
-- on gamification_profiles (simpler than generic inventory; cap 2).
--
-- Also seeds the shop SKU. Price 150 coins ≈ 3-4 active days of earning:
-- login bonus 5 + konsep session ~15 (1 coin/correct, 20 questions) +
-- daily quest trio 10/10/15 ⇒ a typical active day nets ~45 coins.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS, constraint drop-then-add,
-- ON CONFLICT (slug) DO NOTHING.

BEGIN;

ALTER TABLE gamification_profiles
  ADD COLUMN IF NOT EXISTS streak_shields SMALLINT NOT NULL DEFAULT 0
    CHECK (streak_shields BETWEEN 0 AND 2);

-- shop_items.kind gains 'powerup' — the first genuinely deliverable
-- category (delivery = streak_shields increment, no file stub).
ALTER TABLE shop_items DROP CONSTRAINT IF EXISTS shop_items_kind_check;
ALTER TABLE shop_items ADD CONSTRAINT shop_items_kind_check
  CHECK (kind IN ('worksheet','ebook','coloring','sticker','audio','powerup'));

INSERT INTO shop_items (slug, name, description, kind, coin_price, sort_order) VALUES
  ('streak_shield', 'Pelindung Streak',
   'Melindungi streak-mu saat absen 1 hari. Otomatis terpakai.',
   'powerup', 150, 1)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
