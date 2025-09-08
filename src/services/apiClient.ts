import axios from 'axios';
import type { Subject } from '../types/exam';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor to add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Return the entire response to let the request function handle the data structure
    return response;
  },
  (error) => {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
);

async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: unknown
): Promise<T> {
  try {
    const response = await api.request<{ data: T }>({
      url: endpoint,
      method,
      data,
    });
    
    // Handle both array and single item responses
    if (Array.isArray(response.data)) {
      return response.data as T;
    }
    
    // Handle object response
    return response.data.data as T;
  } catch (error) {
    console.error(`API ${method} ${endpoint} failed:`, error);
    throw error;
  }
}

// Auth API
interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  role: string;
  name: string;
}

export const auth = {
  signup: (data: SignupData) => 
    request<AuthResponse>('/auth/signup', 'POST', data),
  login: (data: LoginData) => 
    request<AuthResponse>('/auth/login', 'POST', data),
};

// Subjects API
export const subjects = {
  getAll: () => request<Subject[]>('/subjects'),
  create: (data: Omit<Subject, 'id' | 'createdAt'>) => request<Subject>('/subjects', 'POST', data),
  update: (id: string, data: Partial<Omit<Subject, 'id' | 'createdAt'>>) => 
    request<Subject>(`/subjects/${id}`, 'PUT', data),
  delete: (id: string) => request(`/subjects/${id}`, 'DELETE'),
};

// Questions API
export const questions = {
  getBySubject: (subjectId: string) => request(`/questions/${subjectId}`),
  create: (subjectId: string, data: unknown) => 
    request(`/questions/${subjectId}`, 'POST', data),
};

// Exams API
export const exams = {
  submit: (data: unknown) => request('/exams/submit', 'POST', data),
};

// Results API
export const results = {
  getMine: () => request('/results/me'),
  getAll: () => request('/results'),
};
