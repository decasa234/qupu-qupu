-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age >= 6 AND age <= 16),
  age_group_id UUID,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Age Groups Table
CREATE TABLE IF NOT EXISTS age_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  color_hex VARCHAR(7) DEFAULT '#6B46C1',
  icon_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contents Table
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  age_group_id UUID REFERENCES age_groups(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  youtube_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  number_of_questions INTEGER CHECK (number_of_questions > 0),
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contents_subject ON contents(subject_id);
CREATE INDEX IF NOT EXISTS idx_contents_age_group ON contents(age_group_id);
CREATE INDEX IF NOT EXISTS idx_contents_code ON contents(code);

-- Scores Table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  correct_answers INTEGER CHECK (correct_answers >= 0),
  total_questions INTEGER CHECK (total_questions > 0),
  score_percentage DECIMAL(5,2) CHECK (score_percentage >= 0 AND score_percentage <= 100),
  time_spent_seconds INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_content ON scores(content_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_content ON scores(user_id, content_id);

-- Add foreign key for users -> age_groups (needs to be added after age_groups is created)
ALTER TABLE users ADD CONSTRAINT fk_users_age_group FOREIGN KEY (age_group_id) REFERENCES age_groups(id);

-- Seed Data: Age Groups
INSERT INTO age_groups (name, min_age, max_age, description) VALUES
('6-8 years', 6, 8, 'Early elementary level'),
('8-10 years', 8, 10, 'Upper elementary level'),
('10-12 years', 10, 12, 'Middle school level'),
('12-14 years', 12, 14, 'Junior high level'),
('14-16 years', 14, 16, 'High school level')
ON CONFLICT DO NOTHING;

-- Seed Data: Subjects
INSERT INTO subjects (name, color_hex) VALUES
('Mathematics', '#6B46C1'),
('Literacy', '#F97316'),
('Biology', '#10B981'),
('Chemistry', '#8B5CF6'),
('Physics', '#F59E0B'),
('History', '#EF4444')
ON CONFLICT (name) DO NOTHING;
