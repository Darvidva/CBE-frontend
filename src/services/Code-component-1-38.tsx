import { Subject, Question, ExamAttempt, ExamSession } from '../types/exam';

// Mock data storage
const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    description: 'Basic mathematics concepts and problem solving',
    duration: 60,
    totalQuestions: 10,
    passingScore: 70,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Science',
    description: 'General science knowledge and principles',
    duration: 45,
    totalQuestions: 8,
    passingScore: 75,
    createdAt: '2024-01-02T00:00:00Z'
  }
];

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

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Subject API
export const subjectApi = {
  async getAll(): Promise<Subject[]> {
    await delay(500);
    return [...mockSubjects];
  },

  async create(subject: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
    await delay(500);
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    mockSubjects.push(newSubject);
    return newSubject;
  },

  async update(id: string, updates: Partial<Subject>): Promise<Subject> {
    await delay(500);
    const index = mockSubjects.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subject not found');
    mockSubjects[index] = { ...mockSubjects[index], ...updates };
    return mockSubjects[index];
  },

  async delete(id: string): Promise<void> {
    await delay(500);
    const index = mockSubjects.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subject not found');
    mockSubjects.splice(index, 1);
  }
};

// Question API
export const questionApi = {
  async getBySubjectId(subjectId: string): Promise<Question[]> {
    await delay(500);
    return mockQuestions.filter(q => q.subjectId === subjectId);
  },

  async create(question: Omit<Question, 'id' | 'createdAt'>): Promise<Question> {
    await delay(500);
    const newQuestion: Question = {
      ...question,
      id: 'q' + Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    mockQuestions.push(newQuestion);
    return newQuestion;
  },

  async update(id: string, updates: Partial<Question>): Promise<Question> {
    await delay(500);
    const index = mockQuestions.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Question not found');
    mockQuestions[index] = { ...mockQuestions[index], ...updates };
    return mockQuestions[index];
  },

  async delete(id: string): Promise<void> {
    await delay(500);
    const index = mockQuestions.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Question not found');
    mockQuestions.splice(index, 1);
  }
};

// Exam API
export const examApi = {
  async startExam(subjectId: string, studentId: string): Promise<ExamSession> {
    await delay(500);
    const subject = mockSubjects.find(s => s.id === subjectId);
    if (!subject) throw new Error('Subject not found');
    
    const questions = mockQuestions.filter(q => q.subjectId === subjectId);
    
    return {
      id: 'session_' + Date.now(),
      subjectId,
      studentId,
      questions,
      answers: {},
      timeRemaining: subject.duration * 60, // convert to seconds
      startedAt: new Date().toISOString()
    };
  },

  async submitExam(sessionId: string, answers: Record<string, number>): Promise<ExamAttempt> {
    await delay(500);
    
    // Calculate score
    const questions = mockQuestions;
    let score = 0;
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      if (question && question.correctAnswer === answer) {
        score++;
      }
    });

    const attempt: ExamAttempt = {
      id: 'attempt_' + Date.now(),
      studentId: 'student1', // Should come from session
      studentName: 'Student User',
      subjectId: '1', // Should come from session
      subjectName: 'Mathematics',
      answers,
      score,
      totalQuestions: Object.keys(answers).length,
      percentage: Math.round((score / Object.keys(answers).length) * 100),
      status: 'completed',
      timeRemaining: 0,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    mockExamAttempts.push(attempt);
    return attempt;
  },

  async getStudentResults(studentId: string): Promise<ExamAttempt[]> {
    await delay(500);
    return mockExamAttempts.filter(a => a.studentId === studentId);
  },

  async getAllResults(): Promise<ExamAttempt[]> {
    await delay(500);
    return [...mockExamAttempts];
  }
};