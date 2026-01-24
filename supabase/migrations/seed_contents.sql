-- Seed Data: Contents
INSERT INTO contents (subject_id, age_group_id, code, title, youtube_url, number_of_questions, difficulty) 
SELECT 
  s.id, 
  ag.id, 
  'MATH-001', 
  'Fun Math for Kids - Addition & Subtraction', 
  'https://www.youtube.com/watch?v=igcoDFokKzU', 
  10, 
  'easy'
FROM subjects s, age_groups ag
WHERE s.name = 'Mathematics' AND ag.name = '6-8 years'
ON CONFLICT (code) DO NOTHING;

INSERT INTO contents (subject_id, age_group_id, code, title, youtube_url, number_of_questions, difficulty) 
SELECT 
  s.id, 
  ag.id, 
  'LIT-001', 
  'Phonics Song 2', 
  'https://www.youtube.com/watch?v=BELlZKpi1Zs', 
  15, 
  'easy'
FROM subjects s, age_groups ag
WHERE s.name = 'Literacy' AND ag.name = '6-8 years'
ON CONFLICT (code) DO NOTHING;

INSERT INTO contents (subject_id, age_group_id, code, title, youtube_url, number_of_questions, difficulty) 
SELECT 
  s.id, 
  ag.id, 
  'BIO-001', 
  'The Plant Kingdom: Characteristics and Classification', 
  'https://www.youtube.com/watch?v=H6IrUUDboZo', 
  10, 
  'medium'
FROM subjects s, age_groups ag
WHERE s.name = 'Biology' AND ag.name = '10-12 years'
ON CONFLICT (code) DO NOTHING;

INSERT INTO contents (subject_id, age_group_id, code, title, youtube_url, number_of_questions, difficulty) 
SELECT 
  s.id, 
  ag.id, 
  'PHYS-001', 
  'Newton''s Laws of Motion', 
  'https://www.youtube.com/watch?v=kKKM8Y-u7ds', 
  12, 
  'hard'
FROM subjects s, age_groups ag
WHERE s.name = 'Physics' AND ag.name = '12-14 years'
ON CONFLICT (code) DO NOTHING;

INSERT INTO contents (subject_id, age_group_id, code, title, youtube_url, number_of_questions, difficulty) 
SELECT 
  s.id, 
  ag.id, 
  'HIST-001', 
  'Ancient Egypt 101', 
  'https://www.youtube.com/watch?v=hO1tzmi1V5g', 
  20, 
  'medium'
FROM subjects s, age_groups ag
WHERE s.name = 'History' AND ag.name = '10-12 years'
ON CONFLICT (code) DO NOTHING;
