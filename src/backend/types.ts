// ============================================
// EDUBOT - ALL TYPES & INTERFACES
// ============================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  classLevel: string;
  board: string;
  plan: 'free' | 'basic' | 'premium';
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string;
  dailyQuestionsUsed: number;
  lastQuestionDate: string;
  createdAt: string;
  otpCode?: string;
  otpExpiry?: string;
  isVerified: boolean;
}

export interface Question {
  id: string;
  subject: string;
  chapter: string;
  classLevel: string;
  board: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Progress {
  id: string;
  userId: string;
  subject: string;
  classLevel: string;
  board: string;
  completedChapters: string[];
  totalChapters: number;
  percentage: number;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  subject: string;
  chapter: string;
  score: number;
  totalQuestions: number;
  answers: number[];
  completedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  plan: 'basic' | 'premium';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  createdAt: string;
  expiresAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  message: string;
  subject?: string;
  createdAt: string;
}

export interface PrayerTime {
  city: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  classLevel: string;
  board: string;
}

export interface OTPVerifyRequest {
  phone: string;
  otp: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

// ============================================
// UI / FRONTEND TYPES (used by App.tsx & components)
// ============================================

// PublicUser is the user object exposed to the UI layer (no password/otp).
export interface PublicUser {
  id: string;
  name: string;
  city: string;
  board: string;
  plan: "free" | "basic" | "premium";
  xp: number;
  level: number;
  streak: number;
  className: string;
  createdAt: string;
  planExpiresAt?: string;
  dailyUsed: number;
  lastUsedDate: string;
}

// Assignment shape used by the dashboard cards.
export interface Assignment {
  id: string;
  subject: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "submitted" | "overdue";
  difficulty: "Easy" | "Medium" | "Hard";
  questions: number;
  marks: number;
  obtainedMarks?: number;
  due: string;
  icon: string;
}

export interface SubjectProgress {
  subject: string;
  progress: number;
  icon: string;
  color: string;
}

export interface QuizResult {
  id: string;
  subject: string;
  score: number;
  total: number;
  xpEarned: number;
  takenAt: string;
}
