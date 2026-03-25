export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  fitness_goal?: string;
  experience?: string;
  health_notes?: string;
  avatar_url?: string;
  created_at: string;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  stock: number;
  published: number;
  created_at: string;
}

export interface Exercise {
  id: number;
  training_id: number;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  description?: string;
  order_index: number;
}

export interface Training {
  id: number;
  title: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  image_url?: string;
  published: number;
  created_at: string;
  exercises?: Exercise[];
}

export interface UserTraining {
  id: number;
  user_id: number;
  training_id: number;
  assigned_at: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
  training_title?: string;
  training_description?: string;
  difficulty?: string;
  duration_weeks?: number;
  user_name?: string;
  user_email?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
