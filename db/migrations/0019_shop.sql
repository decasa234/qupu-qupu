-- Phase 2 shop: items catalog + per-child inventory.
--
-- shop_items: the catalog. Mock digital products (worksheet / ebook /
-- coloring / sticker / audio). is_active soft-deletes without
-- breaking purchased rows (RESTRICT below).
--
-- child_inventory: idempotency of (child_id, shop_item_id) IS the
-- purchase guard. coin_balance debit happens atomically against
-- gamification_profiles (CHECK >= 0 from migration 0018).
--
-- See docs/superpowers/specs/2026-05-25-duolingo-gamification-phase2-design.md

BEGIN;

CREATE TABLE IF NOT EXISTS shop_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('worksheet','ebook','coloring','sticker','audio')),
  coin_price    INT  NOT NULL CHECK (coin_price > 0),
  thumbnail_url TEXT,
  sort_order    INT  NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shop_items_active_sort
  ON shop_items (is_active, sort_order) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS child_inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id)    ON DELETE CASCADE,
  shop_item_id  UUID NOT NULL REFERENCES shop_items(id)  ON DELETE RESTRICT,
  coins_spent   INT  NOT NULL CHECK (coins_spent >= 0),
  acquired_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, shop_item_id)
);
CREATE INDEX IF NOT EXISTS idx_child_inventory_child
  ON child_inventory (child_id, acquired_at DESC);

-- Seed 12 placeholder items. Slugs are stable so re-runs of the seed
-- file in dev are idempotent.
INSERT INTO shop_items (slug, name, description, kind, coin_price, sort_order) VALUES
  ('worksheet-aksara-1',   'Paket Aksara 1',     'Lembar latihan menulis huruf A–M.',           'worksheet', 100, 10),
  ('worksheet-aksara-2',   'Paket Aksara 2',     'Lembar latihan menulis huruf N–Z.',           'worksheet', 100, 11),
  ('worksheet-angka-1',    'Paket Angka 1',      'Latihan menulis dan menghitung 1–20.',        'worksheet', 100, 12),
  ('worksheet-angka-2',    'Paket Angka 2',      'Soal cerita penjumlahan untuk pemula.',       'worksheet', 100, 13),
  ('ebook-petualangan',    'Cerita Petualangan', 'E-book cerita pendek bergambar.',             'ebook',     200, 20),
  ('ebook-sains',          'Sains Seru',         'E-book pengantar konsep sains untuk anak.',   'ebook',     200, 21),
  ('ebook-dongeng',        'Kumpulan Dongeng',   'Lima dongeng pilihan dengan ilustrasi.',      'ebook',     200, 22),
  ('coloring-hewan',       'Mewarnai: Hewan',    'Buku mewarnai bertema hewan kebun binatang.', 'coloring',  150, 30),
  ('coloring-kendaraan',   'Mewarnai: Kendaraan','Buku mewarnai bertema kendaraan.',            'coloring',  150, 31),
  ('sticker-mascot',       'Stiker Mascot',      'Paket stiker tokoh QUPU.',                    'sticker',    50, 40),
  ('sticker-musim',        'Stiker Musim',       'Paket stiker bertema empat musim.',           'sticker',    50, 41),
  ('audio-cerita',         'Audio: Dongeng',     'Audio dongeng 10 menit untuk pengantar tidur.','audio',    300, 50)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
