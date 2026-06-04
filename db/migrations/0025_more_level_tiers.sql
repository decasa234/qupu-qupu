-- Extend the level ladder from 5 to 25 tiers (levels 6-25). Idempotent on
-- level_number. Levels derive from total_xp via levelCurve, so adding rows just
-- lengthens the ladder. NOTE: the API caches level_tiers in-process — restart
-- the server (or redeploy) after applying so the new tiers are served.

BEGIN;

INSERT INTO level_tiers (level_number, tier_name, min_xp, theme_key, sort_order) VALUES
  (6,  'Ahli Muda',         1400,  'ahli_muda',         6),
  (7,  'Bintang Kelas',     2000,  'bintang_kelas',     7),
  (8,  'Juara Kelas',       2700,  'juara_kelas',       8),
  (9,  'Pendekar Angka',    3500,  'pendekar_angka',    9),
  (10, 'Ksatria Ilmu',      4400,  'ksatria_ilmu',      10),
  (11, 'Jagoan Hitung',     5400,  'jagoan_hitung',     11),
  (12, 'Bintang Cemerlang', 6600,  'bintang_cemerlang', 12),
  (13, 'Maestro Muda',      8000,  'maestro_muda',      13),
  (14, 'Profesor Cilik',    9600,  'profesor_cilik',    14),
  (15, 'Sang Juara',        11400, 'sang_juara',        15),
  (16, 'Legenda Kelas',     13400, 'legenda_kelas',     16),
  (17, 'Pahlawan Ilmu',     15700, 'pahlawan_ilmu',     17),
  (18, 'Bintang Emas',      18300, 'bintang_emas',      18),
  (19, 'Bintang Platinum',  21200, 'bintang_platinum',  19),
  (20, 'Master Agung',      24400, 'master_agung',      20),
  (21, 'Juara Sejati',      28000, 'juara_sejati',      21),
  (22, 'Bintang Galaksi',   32000, 'bintang_galaksi',   22),
  (23, 'Legenda Hidup',     36500, 'legenda_hidup',     23),
  (24, 'Maha Bijak',        41500, 'maha_bijak',        24),
  (25, 'Sang Legenda',      47000, 'sang_legenda',      25)
ON CONFLICT (level_number) DO NOTHING;

COMMIT;
