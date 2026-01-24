export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  age: number;
  age_group_id: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  is_verified: boolean;
  age_groups?: {
    name: string;
  };
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface AgeGroup {
  id: string;
  name: string;
  min_age: number;
  max_age: number;
  description: string;
}

export interface Subject {
  id: string;
  name: string;
  color_hex: string;
  icon_url: string;
}

export interface Content {
  id: string;
  subject_id: string;
  age_group_id: string;
  code: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string;
  number_of_questions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  created_at: string;
  subjects?: {
    name: string;
    color_hex: string;
  };
  age_groups?: {
    name: string;
  };
}

export interface Score {
  id: string;
  user_id: string;
  content_id: string;
  correct_answers: number;
  total_questions: number;
  score_percentage: number;
  time_spent_seconds: number;
  created_at: string;
  contents?: {
    title: string;
    code: string;
    subjects?: {
      name: string;
      color_hex: string;
    };
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    contents: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}
