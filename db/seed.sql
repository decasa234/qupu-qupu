INSERT INTO age_groups (name, min_age, max_age, description) VALUES
  ('Usia 5-8', 5, 8, 'Fase awal belajar membaca, berhitung, dan logika dasar.'),
  ('Usia 8-10', 8, 10, 'Fase eksplorasi soal yang lebih panjang dan visual.'),
  ('Usia 10-12', 10, 12, 'Fase latihan konsisten dan tantangan campuran.')
ON CONFLICT (name) DO UPDATE
SET min_age = EXCLUDED.min_age,
    max_age = EXCLUDED.max_age,
    description = EXCLUDED.description;

INSERT INTO subjects (name, slug, color_hex, description, default_badge_ranges) VALUES
  ('Matematika I', 'matematika-i', '#EF4444', 'Latihan berhitung dasar untuk anak.',
   '[
      {"minCorrect": 0, "maxCorrect": 14, "badgeCount": 1},
      {"minCorrect": 15, "maxCorrect": 20, "badgeCount": 3}
    ]'::jsonb),
  ('Literasi I', 'literasi-i', '#2563EB', 'Latihan membaca, kata, dan pemahaman bahasa.',
   '[
      {"minCorrect": 0, "maxCorrect": 12, "badgeCount": 1},
      {"minCorrect": 13, "maxCorrect": 24, "badgeCount": 2},
      {"minCorrect": 25, "maxCorrect": 40, "badgeCount": 3},
      {"minCorrect": 41, "maxCorrect": 55, "badgeCount": 4},
      {"minCorrect": 56, "maxCorrect": 60, "badgeCount": 5}
    ]'::jsonb),
  ('Aljabar I', 'aljabar-i', '#8B5CF6', 'Aljabar dasar dan logika persamaan.',
   '[
      {"minCorrect": 0, "maxCorrect": 12, "badgeCount": 1},
      {"minCorrect": 13, "maxCorrect": 24, "badgeCount": 3},
      {"minCorrect": 25, "maxCorrect": 30, "badgeCount": 5}
    ]'::jsonb),
  ('Odd One Out', 'odd-one-out', '#F97316', 'Cari beda, observasi visual, dan tantangan logika cepat.',
   '[
      {"minCorrect": 0, "maxCorrect": 12, "badgeCount": 1},
      {"minCorrect": 13, "maxCorrect": 24, "badgeCount": 2},
      {"minCorrect": 25, "maxCorrect": 40, "badgeCount": 3},
      {"minCorrect": 41, "maxCorrect": 55, "badgeCount": 4},
      {"minCorrect": 56, "maxCorrect": 60, "badgeCount": 5}
    ]'::jsonb)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    color_hex = EXCLUDED.color_hex,
    description = EXCLUDED.description,
    default_badge_ranges = EXCLUDED.default_badge_ranges;

WITH source_videos AS (
  SELECT *
  FROM (
    VALUES
      (
        'kuis-matematika-dasar-part-10',
        'AelKNOcUb18',
        '90% Anak Salah Jawab Soal Ini! Kuis Matematika Dasar Part 10',
        'Kuis hitung cepat ala QUPU untuk menguji logika anak.',
        'Matematika I', 'Usia 5-8',
        15, 'hard', TRUE, TRUE, 1,
        '2026-04-22T11:27:20Z'::timestamptz
      ),
      (
        'mengapung-atau-tenggelam-50-soal',
        'Piu5js9Y_wM',
        '90% Orang Salah Tebak Ini! Mengapung atau Tenggelam? 50 Soal',
        'Tebak mengapung atau tenggelam dalam 50 soal observasi cepat.',
        'Odd One Out', 'Usia 5-8',
        50, 'hard', TRUE, TRUE, 2,
        '2026-04-21T11:25:53Z'::timestamptz
      ),
      (
        'aljabar-dasar-part-16',
        'Tqi44PfmNLk',
        'Berani Jawab Soal Aljabar Ini? Aljabar Dasar Part 16 (Kelas 5-6 SD)',
        'Aljabar dasar level Kelas 5-6 SD untuk menantang logika anak.',
        'Aljabar I', 'Usia 10-12',
        15, 'hard', TRUE, TRUE, 3,
        '2026-04-21T10:32:00Z'::timestamptz
      ),
      (
        'cari-perbedaan-emoji-part-34',
        'ztrq7Pnhc0A',
        'Bisa Temukan Semua Bedanya? Cari Perbedaan Emoji Part 34',
        'Cari semua perbedaan emoji sebelum waktunya habis.',
        'Odd One Out', 'Usia 5-8',
        15, 'medium', TRUE, TRUE, 4,
        '2026-04-20T01:52:12Z'::timestamptz
      ),
      (
        'tebak-buah-dari-irisan-dalamnya',
        '365R2LcvEFU',
        'Bisa Tebak Buah dari Irisan Dalamnya? 45 Soal Tebak Gambar Buah',
        'Tebak nama buah hanya dari tampilan irisan dalamnya.',
        'Literasi I', 'Usia 5-8',
        45, 'medium', TRUE, TRUE, 5,
        '2026-04-17T07:42:50Z'::timestamptz
      ),
      (
        'aljabar-dasar-part-15',
        'wfrLg3rEnc8',
        'Pecahkan Soal Ini! Aljabar Dasar Part 15 (Kuis Matematika Anak 5-8)',
        'Latihan aljabar dasar untuk anak usia 5-8 tahun.',
        'Aljabar I', 'Usia 5-8',
        15, 'medium', TRUE, FALSE, 6,
        '2026-04-13T05:32:10Z'::timestamptz
      ),
      (
        'kuis-matematika-dasar-part-9',
        'pQEM46m8_jM',
        'Kuis Matematika Dasar Part 9 | Uji Hitung Kamu! | Kelas TK - 1 SD',
        'Latihan hitung untuk usia TK sampai kelas 1 SD.',
        'Matematika I', 'Usia 5-8',
        15, 'easy', TRUE, FALSE, 7,
        '2026-04-12T12:46:45Z'::timestamptz
      ),
      (
        'kuis-matematika-dasar-part-8',
        '6PoJOtXzcUY',
        'Kuis Matematika Dasar Part 8 | Uji Hitung Kamu! | Kelas TK - 1 SD',
        'Latihan hitung untuk usia TK sampai kelas 1 SD.',
        'Matematika I', 'Usia 5-8',
        15, 'easy', TRUE, FALSE, 8,
        '2026-04-11T06:44:22Z'::timestamptz
      ),
      (
        'cari-perbedaan-emoji-part-33',
        'FlgCGndCjXc',
        'Kamu Bisa Sampai Level Berapa? Cari Perbedaan Emoji Part 33',
        'Cari semua perbedaan emoji dengan cermat.',
        'Odd One Out', 'Usia 5-8',
        15, 'medium', TRUE, FALSE, 9,
        '2026-04-10T09:22:55Z'::timestamptz
      ),
      (
        'aljabar-dasar-part-14',
        'EVeggRU_TCM',
        'Pecahkan Soal Ini! Aljabar Dasar Part 14 (Kuis Matematika Anak 5-8)',
        'Latihan aljabar dasar untuk anak usia 5-8 tahun.',
        'Aljabar I', 'Usia 5-8',
        15, 'medium', TRUE, FALSE, 10,
        '2026-04-09T11:08:08Z'::timestamptz
      ),
      (
        'kuis-matematika-dasar-part-7',
        '5tJI2pDFy9w',
        'Kuis Matematika Dasar Part 7 | Uji Hitung Kamu! | Kelas TK - 1 SD',
        'Latihan hitung untuk usia TK sampai kelas 1 SD.',
        'Matematika I', 'Usia 5-8',
        15, 'easy', TRUE, FALSE, 11,
        '2026-04-08T09:12:48Z'::timestamptz
      ),
      (
        'aljabar-dasar-part-13',
        'KSh9MJEF2iA',
        'Test Otak Kamu! Aljabar Dasar Part 13 (Kuis Matematika Anak 5-8)',
        'Latihan aljabar dasar untuk anak usia 5-8 tahun.',
        'Aljabar I', 'Usia 5-8',
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
  qv.number_of_questions,
  qv.difficulty,
  qv.is_published,
  qv.is_featured,
  qv.sort_order,
  qv.published_at
FROM source_videos qv
JOIN subjects s ON s.name = qv.subject_name
JOIN age_groups ag ON ag.name = qv.age_group_name
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    youtube_url = EXCLUDED.youtube_url,
    youtube_video_id = EXCLUDED.youtube_video_id,
    subject_id = EXCLUDED.subject_id,
    age_group_id = EXCLUDED.age_group_id,
    number_of_questions = EXCLUDED.number_of_questions,
    difficulty = EXCLUDED.difficulty,
    is_published = EXCLUDED.is_published,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

-- Default badge ranges per video: 3 ranges scaling with question count.
-- 0..ceil(nq*0.34)-1   = 1 badge
-- ceil(nq*0.34)..ceil(nq*0.67)-1 = 2 badges
-- ceil(nq*0.67)..nq    = 3 badges
DELETE FROM video_badge_rules;

INSERT INTO video_badge_rules (video_id, min_correct, max_correct, badge_count)
SELECT
  v.id,
  CASE level
    WHEN 1 THEN 0
    WHEN 2 THEN CEIL(v.number_of_questions::numeric * 0.34)::INT
    WHEN 3 THEN CEIL(v.number_of_questions::numeric * 0.67)::INT
  END,
  CASE level
    WHEN 1 THEN CEIL(v.number_of_questions::numeric * 0.34)::INT - 1
    WHEN 2 THEN CEIL(v.number_of_questions::numeric * 0.67)::INT - 1
    WHEN 3 THEN NULL
  END,
  level
FROM videos v
CROSS JOIN (VALUES (1), (2), (3)) AS t(level);
