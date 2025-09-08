// src/lib/api.ts
import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  Subject,
  Question,
  ExamSession,
  ExamSubmission,
  ExamAttempt,
} from '../types/api';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
      throw new Error(error.response.data.detail as string);
    }
    throw error;
  }
);

// Auth API
export const auth = {
  login: (data: LoginRequest) => 
    api.post<any, AuthResponse>('/auth/login', data),
  signup: (data: SignupRequest) => 
    api.post<any, AuthResponse>('/auth/signup', data),
};

// Subjects API
export const subjects = {
  getAll: () => 
    api.get<any, Subject[]>('/subjects'),
  create: (data: Omit<Subject, 'id' | 'createdAt'>) => 
    api.post<any, Subject>('/subjects', data),
  update: (id: number, data: Partial<Subject>) => 
    api.put<any, Subject>(`/subjects/${id}`, data),
  delete: (id: number) => 
    api.delete(`/subjects/${id}`),
};

// Questions API
export const questions = {
  getBySubject: (subjectId: number) => 
    api.get<any, Question[]>(`/questions/${subjectId}`),
  create: (subjectId: number, data: Omit<Question, 'id' | 'createdAt' | 'subjectId'>) => 
    api.post<any, Question>(`/questions/${subjectId}`, data),
};

// Exams API
export const exams = {
  start: (subjectId: number) =>
    api.post<any, ExamSession>(`/exams/start/${subjectId}`),
  submit: (data: ExamSubmission) => 
    api.post<any, ExamAttempt>('/exams/submit', data),
};

// Results API
export const results = {
  getMine: () => 
    api.get<any, ExamAttempt[]>('/results/me'),
  getAll: () => 
    api.get<any, ExamAttempt[]>('/results'),
};
