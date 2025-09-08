import { Question, APIQuestion } from '../types/exam';
import { api } from './api';

// Convert backend response to frontend Question type
const mapAPIQuestionToQuestion = (apiQuestion: APIQuestion): Question => {
  const correctAnswerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
  return {
    id: String(apiQuestion.id),
    subjectId: String(apiQuestion.subject_id),
    question: apiQuestion.question_text,
    options: [
      apiQuestion.option_a,
      apiQuestion.option_b,
      apiQuestion.option_c,
      apiQuestion.option_d,
    ] as [string, string, string, string],
    correctAnswer: correctAnswerMap[apiQuestion.correct_option] ?? 0,
    createdAt: apiQuestion.created_at || new Date().toISOString(),
  };
};

// Convert frontend Question type to backend format
const mapQuestionToAPI = (question: Partial<Question>) => ({
  question_text: question.question,
  ...(question.options && {
    option_a: question.options[0],
    option_b: question.options[1],
    option_c: question.options[2],
    option_d: question.options[3],
  }),
  ...(question.correctAnswer !== undefined && {
    correct_option: ['A', 'B', 'C', 'D'][question.correctAnswer],
  }),
});

export const questionService = {
  async getBySubject(subjectId: string) {
    try {
      console.log('Fetching questions for subject:', subjectId);
      // Axios interceptor returns data directly
      const data = await api.get<APIQuestion[] | APIQuestion>(`/questions/${subjectId}`);
      console.log('API Response (data):', data);

      const apiQuestions = Array.isArray(data) ? data : data ? [data] : [];
      if (!apiQuestions.length) {
        console.warn('No questions returned from API');
        return [];
      }

      return apiQuestions.map(mapAPIQuestionToQuestion);
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  async create(subjectId: string, question: Omit<Question, 'id' | 'createdAt'>) {
    try {
      console.log('Creating question:', { subjectId, question });
      // Axios interceptor returns data directly
      const created = await api.post<APIQuestion>(`/questions/${subjectId}`, mapQuestionToAPI(question));
      console.log('Create response (data):', created);
      return mapAPIQuestionToQuestion(created);
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  async update(id: string, question: Partial<Question>) {
    try {
      console.log('Updating question:', { id, question });
      // Axios interceptor returns data directly
      const updated = await api.put<APIQuestion>(`/questions/${id}`, mapQuestionToAPI(question));
      console.log('Update response (data):', updated);
      return mapAPIQuestionToQuestion(updated);
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      console.log('Deleting question:', id);
      await api.delete(`/questions/${id}`);
      console.log('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },
};
