export interface Subject {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number; // percentage
  createdAt: string;
}

export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: [string, string, string, string]; // exactly 4 options
  correctAnswer: number; // index 0-3
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  answers: Record<string, number>; // questionId -> selected option index
  score: number;
  totalQuestions: number;
  percentage: number;
  status: 'completed' | 'in-progress';
  timeRemaining: number; // in seconds
  submittedAt?: string;
  createdAt: string;
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