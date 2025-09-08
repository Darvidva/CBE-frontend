import axios from 'axios';
import { Subject, Question, ExamAttempt, ExamSession, APIQuestion } from '../types/exam';

const API_URL = 'https://cbe-backend.onrender.com/api/v1';

export const api = axios.create({
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
  console.log('API Request:', { url: config.url, method: config.method, data: config.data });
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', { url: response.config.url, status: response.status, data: response.data });
    if (response.data === null || response.data === undefined) {
      console.warn('Empty response data, returning empty array');
      return [];
    }
    return response.data;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      error: error.response?.data?.detail || error.message
    });
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
);

const mockQuestions: Question[] = [
  {
    id: 'q1',
    subjectId: '1',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'q2',
    subjectId: '1',
    question: 'What is 10 - 7?',
    options: ['2', '3', '4', '5'],
    correctAnswer: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'q3',
    subjectId: '2',
    question: 'What is the chemical symbol for water?',
    options: ['H2O', 'CO2', 'O2', 'N2'],
    correctAnswer: 0,
    createdAt: '2024-01-02T00:00:00Z'
  }
];

const mockExamAttempts: ExamAttempt[] = [
  {
    id: 'attempt1',
    studentId: 'student1',
    studentName: 'Student User',
    subjectId: '1',
    subjectName: 'Mathematics',
    answers: { 'q1': 1, 'q2': 1 },
    score: 2,
    totalQuestions: 2,
    percentage: 100,
    status: 'completed',
    timeRemaining: 0,
    submittedAt: '2024-01-10T10:00:00Z',
    createdAt: '2024-01-10T09:00:00Z'
  }
];

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
    api.post<any, AuthResponse>('/auth/signup', data),
  login: (data: LoginData) => 
    api.post<any, AuthResponse>('/auth/login', data),
};

// Subject API
export const subjects = {
  getAll: async () => {
    const response = await api.get('/subjects');
    return Array.isArray(response) ? response : [];
  },
  create: (data: Omit<Subject, 'id' | 'createdAt'>) => api.post('/subjects', data),
  update: (id: string, data: Partial<Subject>) => api.put(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`)
};

// Questions API
export const questions = {
  getBySubject: async (subjectId: string) => {
    try {
      console.log('Fetching questions for subject:', subjectId);
      const response = await api.get<any, APIQuestion[]>(`/questions/${subjectId}`);
      console.log('API response:', response);
      
      // For development/testing, return mock data if API fails
      if (!response) {
        console.warn('No response from API, using mock data');
        return mockQuestions.filter(q => q.subjectId === subjectId);
      }
      
      const questionsData = Array.isArray(response) ? response : [response];
      console.log('Questions data:', questionsData);
      
      return questionsData.map(q => ({
        id: q.id || String(Date.now()),
        subjectId: typeof q.subject_id === 'number' ? q.subject_id.toString() : q.subject_id,
        question: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d] as [string, string, string, string],
        correctAnswer: q.correct_option === 'A' ? 0 : q.correct_option === 'B' ? 1 : q.correct_option === 'C' ? 2 : q.correct_option === 'D' ? 3 : 0,
        createdAt: q.created_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },
  create: async (subjectId: string, data: Omit<Question, 'id' | 'createdAt'>) => {
    const apiData = {
      question_text: data.question,
      option_a: data.options[0],
      option_b: data.options[1],
      option_c: data.options[2],
      option_d: data.options[3],
      correct_option: ['A', 'B', 'C', 'D'][data.correctAnswer] as 'A' | 'B' | 'C' | 'D'
    };
    const responseData = await api.post<any, APIQuestion>(`/questions/${subjectId}`, apiData);

    // If the response is successful but data is missing, create a default response
    const ensured = responseData || {
      id: '0',  // This will be replaced with actual data on reload
      subject_id: parseInt(subjectId),
      question_text: data.question,
      option_a: data.options[0],
      option_b: data.options[1],
      option_c: data.options[2],
      option_d: data.options[3],
      correct_option: ['A', 'B', 'C', 'D'][data.correctAnswer] as 'A' | 'B' | 'C' | 'D'
    };

    return {
      id: ensured.id.toString(),
      subjectId: ensured.subject_id.toString(),
      question: ensured.question_text,
      options: [ensured.option_a, ensured.option_b, ensured.option_c, ensured.option_d] as [string, string, string, string],
      correctAnswer: ['A', 'B', 'C', 'D'].indexOf(ensured.correct_option),
      createdAt: new Date().toISOString()
    };
  },
  update: async (id: string, data: Partial<Question>) => {
    const apiData = {
      ...(data.question && { question_text: data.question }),
      ...(data.options && {
        option_a: data.options[0],
        option_b: data.options[1],
        option_c: data.options[2],
        option_d: data.options[3],
      }),
      ...(data.correctAnswer !== undefined && { 
        correct_option: ['A', 'B', 'C', 'D'][data.correctAnswer] as 'A' | 'B' | 'C' | 'D'
      })
    };
    const updated = await api.put<any, APIQuestion>(`/questions/${id}`, apiData);
    return {
      id: updated.id,
      subjectId: updated.subject_id.toString(),
      question: updated.question_text,
      options: [updated.option_a, updated.option_b, updated.option_c, updated.option_d] as [string, string, string, string],
      correctAnswer: ['A', 'B', 'C', 'D'].indexOf(updated.correct_option),
      createdAt: updated.created_at || new Date().toISOString()
    };
  },
  delete: async (id: string) => {
    await api.delete(`/questions/${id}`);
  }
};

// Exams API
export const exams = {
  submit: (data: ExamAttempt) => 
    api.post<ExamAttempt>('/exams/submit', data),
  start: (subjectId: string) =>
    api.post<ExamSession>(`/exams/start/${subjectId}`),
};

// Results API
export const results = {
  getMine: () => api.get<ExamAttempt[]>('/results/me'),
  getAll: () => api.get<ExamAttempt[]>('/results'),
};

// Exam API
export const examApi = {
  async startExam(subjectId: string): Promise<ExamSession> {
    // Backend returns: { subject_id, questions: [{ id, question_text, options: {A,B,C,D}}], time_remaining }
    const data: any = await api.post(`/exams/start/${subjectId}`);
    const storedUser = localStorage.getItem('user');
    const userId = storedUser ? JSON.parse(storedUser)?.id?.toString?.() : 'me';

    const session: ExamSession = {
      id: String(subjectId),
      subjectId: String(data.subject_id ?? subjectId),
      studentId: userId || 'me',
      questions: (data.questions || []).map((q: any) => ({
        id: String(q.id),
        subjectId: String(data.subject_id ?? subjectId),
        question: q.question_text,
        options: [q.options?.A, q.options?.B, q.options?.C, q.options?.D],
        correctAnswer: -1,
        createdAt: new Date().toISOString(),
      })),
      answers: {},
      timeRemaining: Number(data.time_remaining ?? 0),
      startedAt: new Date().toISOString(),
    };
    return session;
  },

  async submitExam(sessionId: string, answers: Record<string, number>): Promise<ExamAttempt> {
    const subjectId = sessionId; // startExam set id to subjectId
    const payload = {
      subject_id: parseInt(subjectId, 10),
      answers: Object.entries(answers).map(([questionId, optionIndex]) => ({
        question_id: parseInt(questionId, 10),
        selected_option: ['A', 'B', 'C', 'D'][Number(optionIndex)]
      }))
    };
    const result: any = await api.post('/exams/submit', payload);
    // Map minimal attempt for navigation; ResultPage uses mock data
    const attempt: ExamAttempt = {
      id: `${Date.now()}`,
      studentId: 'me',
      studentName: 'Me',
      subjectId: String(subjectId),
      subjectName: '',
      answers: {},
      score: Number(result?.score ?? 0),
      totalQuestions: Number(result?.total ?? 0),
      percentage: Number(result?.percentage ?? 0),
      status: (result?.status ?? 'completed') as any,
      timeRemaining: 0,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    return attempt;
  },

  async getStudentResults(studentId: string): Promise<ExamAttempt[]> {
    return api.get(`/results/${studentId}`);
  },

  async getAllResults(): Promise<ExamAttempt[]> {
    return api.get('/results');
  }
};