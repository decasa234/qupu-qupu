INSERT INTO age_groups (name, min_age, max_age, description) VALUES
  ('Usia 5-8', 5, 8, 'Fase awal belajar membaca, berhitung, dan logika dasar.'),
  ('Usia 8-10', 8, 10, 'Fase eksplorasi soal yang lebih panjang dan visual.'),
  ('Usia 10-12', 10, 12, 'Fase latihan konsisten dan tantangan campuran.')
ON CONFLICT (name) DO UPDATE
SET min_age = EXCLUDED.min_age,
    max_age = EXCLUDED.max_age,
    description = EXCLUDED.description;

INSERT INTO subjects (name, slug, color_hex, description) VALUES
  ('Matematika', 'matematika', '#7C3AED', 'Latihan berhitung, pola, dan logika hitung.'),
  ('Literasi', 'literasi', '#F97316', 'Latihan membaca, kata, dan pemahaman bahasa.'),
  ('Emoji', 'emoji', '#A855F7', 'Cari beda, fokus visual, dan tantangan observasi.'),
  ('Tebak Gambar', 'tebak-gambar', '#10B981', 'Kenali objek, buah, dan gambar dari petunjuk visual.'),
  ('Pengetahuan Umum', 'pengetahuan-umum', '#2563EB', 'Sains seru dan pengetahuan umum untuk anak.')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    color_hex = EXCLUDED.color_hex,
    description = EXCLUDED.description;

INSERT INTO badge_families (name, slug, description, color_hex) VALUES
  ('Badge Matematika', 'badge-matematika', 'Reward untuk video berhitung dan logika angka.', '#7C3AED'),
  ('Badge Literasi', 'badge-literasi', 'Reward untuk video huruf, kata, dan bacaan.', '#F97316'),
  ('Badge Emoji', 'badge-emoji', 'Reward untuk video observasi visual dan cari beda.', '#C084FC'),
  ('Badge Tebak Gambar', 'badge-tebak-gambar', 'Reward untuk video tebak gambar dan objek.', '#10B981'),
  ('Badge Pengetahuan Umum', 'badge-pengetahuan-umum', 'Reward untuk video sains dan pengetahuan umum.', '#2563EB')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    color_hex = EXCLUDED.color_hex;

INSERT INTO badge_tiers (family_id, tier, name, icon_name, color_hex)
SELECT bf.id, tier_data.tier, tier_data.name, tier_data.icon_name, tier_data.color_hex
FROM badge_families bf
JOIN (
  VALUES
    (1, 'Explorer', 'Sparkles', '#FDBA74'),
    (2, 'Rising Star', 'Star', '#FB923C'),
    (3, 'QUPU Master', 'Crown', '#7C3AED')
) AS tier_data(tier, name, icon_name, color_hex) ON TRUE
ON CONFLICT (family_id, tier) DO UPDATE
SET name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    color_hex = EXCLUDED.color_hex;

WITH source_videos AS (
  SELECT *
  FROM (
    VALUES
      (
        'pecahkan-soal-penjumlahan-1',
        'Pecahkan Soal Ini! 15 + Burger = 26',
        'Latihan hitung cepat ala QUPU untuk anak yang suka tantangan visual.',
        'https://www.youtube.com/watch?v=igcoDFokKzU',
        'Matematika',
        'Usia 5-8',
        'badge-matematika',
        15,
        'easy',
        TRUE,
        TRUE,
        1
      ),
      (
        'bisa-selesaikan-ini-8-16',
        'Bisa Selesaikan Ini? 8 + 16 = ?',
        'Video hitung singkat dengan ritme cepat untuk melatih fokus.',
        'https://www.youtube.com/watch?v=kKKM8Y-u7ds',
        'Matematika',
        'Usia 8-10',
        'badge-matematika',
        20,
        'medium',
        TRUE,
        TRUE,
        2
      ),
      (
        'tebak-buah-dari-irisan',
        'Bisa Tebak Buah dari Irisannya?',
        'Tantangan literasi visual dan penamaan buah untuk anak.',
        'https://www.youtube.com/watch?v=BELlZKpi1Zs',
        'Literasi',
        'Usia 5-8',
        'badge-literasi',
        12,
        'easy',
        TRUE,
        FALSE,
        3
      ),
      (
        'cari-perbedaan-emoji-part-34',
        'Cari Perbedaan Emoji Part 34',
        'Cari semua perbedaan emoji sebelum waktunya habis.',
        'https://www.youtube.com/watch?v=H6IrUUDboZo',
        'Emoji',
        'Usia 8-10',
        'badge-emoji',
        18,
        'medium',
        TRUE,
        FALSE,
        4
      )
  ) AS rows(
    slug,
    title,
    description,
    youtube_url,
    subject_name,
    age_group_name,
    badge_family_slug,
    number_of_questions,
    difficulty,
    is_published,
    is_featured,
    sort_order
  )
)
INSERT INTO videos (
  slug,
  title,
  description,
  youtube_url,
  youtube_video_id,
  thumbnail_url,
  subject_id,
  age_group_id,
  badge_family_id,
  number_of_questions,
  difficulty,
  is_published,
  is_featured,
  sort_order,
  published_at
)
SELECT
  sv.slug,
  sv.title,
  sv.description,
  sv.youtube_url,
  CASE
    WHEN position('v=' IN sv.youtube_url) > 0 THEN split_part(split_part(sv.youtube_url, 'v=', 2), '&', 1)
    ELSE sv.youtube_url
  END,
  NULL,
  s.id,
  ag.id,
  bf.id,
  sv.number_of_questions,
  sv.difficulty,
  sv.is_published,
  sv.is_featured,
  sv.sort_order,
  NOW()
FROM source_videos sv
JOIN subjects s ON s.name = sv.subject_name
JOIN age_groups ag ON ag.name = sv.age_group_name
JOIN badge_families bf ON bf.slug = sv.badge_family_slug
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    youtube_url = EXCLUDED.youtube_url,
    youtube_video_id = EXCLUDED.youtube_video_id,
    subject_id = EXCLUDED.subject_id,
    age_group_id = EXCLUDED.age_group_id,
    badge_family_id = EXCLUDED.badge_family_id,
    number_of_questions = EXCLUDED.number_of_questions,
    difficulty = EXCLUDED.difficulty,
    is_published = EXCLUDED.is_published,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Demote legacy placeholder videos so the QUPU catalog surfaces first.
UPDATE videos
SET sort_order = 100, is_featured = FALSE
WHERE slug IN (
  'pecahkan-soal-penjumlahan-1',
  'bisa-selesaikan-ini-8-16',
  'tebak-buah-dari-irisan'
);

-- QUPU_VIDEOS migrated from src/data/qupuVideos.ts. DB is now the runtime source of truth.
WITH qupu_videos AS (
  SELECT *
  FROM (
    VALUES
      (
        'kuis-matematika-dasar-part-10',
        'AelKNOcUb18',
        '90% Anak Salah Jawab Soal Ini! Kuis Matematika Dasar Part 10',
        'Kuis hitung cepat ala QUPU untuk menguji logika anak.',
        'Matematika', 'Usia 5-8', 'badge-matematika',
        15, 'hard', TRUE, TRUE, 1,
        '2026-04-22T11:27:20Z'::timestamptz
      ),
      (
        'mengapung-atau-tenggelam-50-soal',
        'Piu5js9Y_wM',
        '90% Orang Salah Tebak Ini! Mengapung atau Tenggelam? 50 Soal Sains Seru',
        'Tebak mengapung atau tenggelam dalam 50 soal sains seru.',
        'Pengetahuan Umum', 'Usia 5-8', 'badge-pengetahuan-umum',
        50, 'hard', TRUE, TRUE, 2,
        '2026-04-21T11:25:53Z'::timestamptz
      ),
      (
        'aljabar-dasar-part-16',
        'Tqi44PfmNLk',
        'Berani Jawab Soal Aljabar Ini? Aljabar Dasar Part 16 (Kelas 5-6 SD)',
        'Aljabar dasar level Kelas 5-6 SD untuk menantang logika anak.',
        'Matematika', 'Usia 10-12', 'badge-matematika',
        15, 'hard', TRUE, TRUE, 3,
        '2026-04-21T10:32:00Z'::timestamptz
      ),
      (
        'cari-perbedaan-emoji-part-34',
        'ztrq7Pnhc0A',
        'Bisa Temukan Semua Bedanya? Cari Perbedaan Emoji Part 34',
        'Cari semua perbedaan emoji sebelum waktunya habis.',
        'Emoji', 'Usia 5-8', 'badge-emoji',
        15, 'medium', TRUE, TRUE, 4,
        '2026-04-20T01:52:12Z'::timestamptz
      ),
      (
        'tebak-buah-dari-irisan-dalamnya',
        '365R2LcvEFU',
        'Bisa Tebak Buah dari Irisan Dalamnya? 45 Soal Tebak Gambar Buah',
        'Tebak nama buah hanya dari tampilan irisan dalamnya.',
        'Tebak Gambar', 'Usia 5-8', 'badge-tebak-gambar',
        45, 'medium', TRUE, TRUE, 5,
        '2026-04-17T07:42:50Z'::timestamptz
      ),
      (
        'aljabar-dasar-part-15',
        'wfrLg3rEnc8',
        'Pecahkan Soal Ini! Aljabar Dasar Part 15 (Kuis Matematika Anak 5-8)',
        'Latihan aljabar dasar untuk anak usia 5-8 tahun.',
        'Matematika', 'Usia 5-8', 'badge-matematika',
        15, 'medium', TRUE, FALSE, 6,
        '2026-04-13T05:32:10Z'::timestamptz
      ),
      (
        'kuis-matematika-dasar-part-9',
        'pQEM46m8_jM',
        'Kuis Matematika Dasar Part 9 | Uji Hitung Kamu! | Kelas TK - 1 SD',
        'Latihan hitung untuk usia TK sampai kelas 1 SD.',
        'Matematika', 'Usia 5-8', 'badge-matematika',
        15, 'easy', TRUE, FALSE, 7,
        '2026-04-12T12:46:45Z'::timestamptz
      ),
      (
        'kuis-matematika-dasar-part-8',
        '6PoJOtXzcUY',
        'Kuis Matematika Dasar Part 8 | Uji Hitung Kamu! | Kelas TK - 1 SD',
        'Latihan hitung untuk usia TK sampai kelas 1 SD.',
        'Matematika', 'Usia 5-8', 'badge-matematika',
        15, 'easy', TRUE, FALSE, 8,
        '2026-04-11T06:44:22Z'::timestamptz
      ),
      (
        'cari-perbedaan-emoji-part-33',
        'FlgCGndCjXc',
        'Kamu Bisa Sampai Level Berapa? Cari Perbedaan Emoji Part 33',
        'Cari semua perbedaan emoji dengan cermat.',
        'Emoji', 'Usia 5-8', 'badge-emoji',
        15, 'medium', TRUE, FALSE, 9,
        '2026-04-10T09:22:55Z'::timestamptz
      ),
      (
        'aljabar-dasar-part-14',
        'EVeggRU_TCM',
        'Pecahkan Soal Ini! Aljabar Dasar Part 14 (Kuis Matematika Anak 5-8)',
        'Latihan aljabar dasar untuk anak usia 5-8 tahun.',
        'Matematika', 'Usia 5-8', 'badge-matematika',
        15, 'medium', TRUE, FALSE, 10,
        '2026-04-09T11:08:08Z'::timestamptz
      ),
      (
        'kuis-matematika-dasar-part-7',
        '5tJI2pDFy9w',
        'Kuis Matematika Dasar Part 7 | Uji Hitung Kamu! | Kelas TK - 1 SD',
        'Latihan hitung untuk usia TK sampai kelas 1 SD.',
        'Matematika', 'Usia 5-8', 'badge-matematika',
        15, 'easy', TRUE, FALSE, 11,
        '2026-04-08T09:12:48Z'::timestamptz
      ),
      (
        'aljabar-dasar-part-13',
        'KSh9MJEF2iA',
        'Test Otak Kamu! Aljabar Dasar Part 13 (Kuis Matematika Anak 5-8)',
        'Latihan aljabar dasar untuk anak usia 5-8 tahun.',
        'Matematika', 'Usia 5-8', 'badge-matematika',
        15, 'medium', TRUE, FALSE, 12,
        '2026-04-07T06:48:02Z'::timestamptz
      )
  ) AS rows(
    slug,
    youtube_video_id,
    title,
    description,
    subject_name,
    age_group_name,
    badge_family_slug,
    number_of_questions,
    difficulty,
    is_published,
    is_featured,
    sort_order,
    published_at
  )
)
INSERT INTO videos (
  slug,
  title,
  description,
  youtube_url,
  youtube_video_id,
  thumbnail_url,
  subject_id,
  age_group_id,
  badge_family_id,
  number_of_questions,
  difficulty,
  is_published,
  is_featured,
  sort_order,
  published_at
)
SELECT
  qv.slug,
  qv.title,
  qv.description,
  'https://www.youtube.com/watch?v=' || qv.youtube_video_id,
  qv.youtube_video_id,
  NULL,
  s.id,
  ag.id,
  bf.id,
  qv.number_of_questions,
  qv.difficulty,
  qv.is_published,
  qv.is_featured,
  qv.sort_order,
  qv.published_at
FROM qupu_videos qv
JOIN subjects s ON s.name = qv.subject_name
JOIN age_groups ag ON ag.name = qv.age_group_name
JOIN badge_families bf ON bf.slug = qv.badge_family_slug
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    youtube_url = EXCLUDED.youtube_url,
    youtube_video_id = EXCLUDED.youtube_video_id,
    subject_id = EXCLUDED.subject_id,
    age_group_id = EXCLUDED.age_group_id,
    badge_family_id = EXCLUDED.badge_family_id,
    number_of_questions = EXCLUDED.number_of_questions,
    difficulty = EXCLUDED.difficulty,
    is_published = EXCLUDED.is_published,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

-- Badge rules scale with number_of_questions so larger quizzes aren't trivially Tier 3.
-- Tier 1: 0 .. ceil(nq * 0.34) - 1
-- Tier 2: ceil(nq * 0.34) .. ceil(nq * 0.67) - 1
-- Tier 3: ceil(nq * 0.67) .. NULL
DELETE FROM video_badge_rules;

INSERT INTO video_badge_rules (video_id, badge_tier_id, min_correct, max_correct)
SELECT
  v.id,
  bt.id,
  CASE bt.tier
    WHEN 1 THEN 0
    WHEN 2 THEN CEIL(v.number_of_questions::numeric * 0.34)::INT
    WHEN 3 THEN CEIL(v.number_of_questions::numeric * 0.67)::INT
  END,
  CASE bt.tier
    WHEN 1 THEN CEIL(v.number_of_questions::numeric * 0.34)::INT - 1
    WHEN 2 THEN CEIL(v.number_of_questions::numeric * 0.67)::INT - 1
    WHEN 3 THEN NULL
  END
FROM videos v
JOIN badge_families bf ON bf.id = v.badge_family_id
JOIN badge_tiers bt ON bt.family_id = bf.id;
