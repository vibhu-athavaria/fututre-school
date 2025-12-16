export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Child {
  id: string
  parent_id: string
  age: number
  grade: string
  user: {
    full_name: string
    username: string
    email: string | null
    role: string
    has_completed_assessment: boolean
  }
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  icon: string;
  type: 'today' | 'upcoming';
  schedule?: string;
  child_id: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  is_user: boolean;
  timestamp: string;
  child_id: string;
}

export interface AuthContextType {
  user: User | null;
  signUpParent: (email: string, password: string, full_name: string) => Promise<void>;
  signInParent: (email: string, password: string) => Promise<void>;
  signInStudent: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export type UserRole = "parent" | "child" | "teacher";
