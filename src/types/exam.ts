export interface Subject {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number; // percentage
  createdAt: string;
}

// Frontend Question type
export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0-3 (A-D)
  createdAt: string;
}

// Backend API question shape used for mapping
export interface APIQuestion {
  id: string | number;
  subject_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  created_at?: string;
}

export interface ExamSession {
  id: string;
  subjectId: string;
  studentId: string;
  questions: Question[];
  answers: Record<string, number>;
  timeRemaining: number;
  startedAt: string;
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  answers: Record<string, number>; // questionId -> selected option index
  score: number;
  total: number;
  percentage: number;
  status: 'completed' | 'in-progress';
  timeRemaining: number; // in seconds
  submittedAt?: string;
  createdAt: string;
}