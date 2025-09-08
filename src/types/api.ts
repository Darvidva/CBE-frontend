// src/types/api.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'student';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: 'admin' | 'student';
  name: string;
  id: number;
}

export interface Subject {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  createdAt: string;
}

export interface Question {
  id: number;
  subjectId: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  createdAt: string;
}

export interface ExamSession {
  subjectId: number;
  subjectName: string;
  questions: Question[];
  timeRemaining: number; // in seconds
  totalQuestions: number;
  startedAt: string;
}

export interface ExamSubmission {
  subjectId: number;
  answers: Record<string, number>; // questionId -> selected answer index
  timeRemaining: number;
}

export interface ExamAttempt {
  id: number;
  subjectId: number;
  subjectName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  status: 'completed' | 'in_progress';
  answers: Record<string, number>;
  timeRemaining: number;
  submittedAt: string;
  createdAt: string;
}
