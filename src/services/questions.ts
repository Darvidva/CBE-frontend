import { api } from './api';
import type { Question, APIQuestion } from '../types/exam';
import type { AxiosResponse } from 'axios';

// Convert API response to frontend Question type
const convertAPIQuestion = (q: APIQuestion): Question => ({
  id: q.id.toString(),
  subjectId: q.subject_id.toString(),
  question: q.question_text,
  options: [q.option_a, q.option_b, q.option_c, q.option_d] as [string, string, string, string],
  correctAnswer: ['A', 'B', 'C', 'D'].indexOf(q.correct_option),
  createdAt: q.created_at || new Date().toISOString()
});

export const questions = {
  getBySubject: async (subjectId: string): Promise<Question[]> => {
    try {
      // Ensure subjectId is a string
      const normalizedSubjectId = String(subjectId);
      console.log('Fetching questions for subject:', { original: subjectId, normalized: normalizedSubjectId });
      
      // Get the data from the response
      const { data } = await api.get<APIQuestion[]>(`/questions/${normalizedSubjectId}`);
      console.log('Raw API response:', data);

      // Handle both array and single item responses
      const apiQuestions = Array.isArray(data) ? data : 
                         data ? [data] : [];
      
      console.log('API questions:', { count: apiQuestions.length, questions: apiQuestions });

      const convertedQuestions = apiQuestions.map(q => convertAPIQuestion(q));
      console.log('Converted questions:', { count: convertedQuestions.length, questions: convertedQuestions });

      return convertedQuestions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  create: async (subjectId: string, data: Omit<Question, 'id' | 'createdAt'>): Promise<Question> => {
    const apiData = {
      question_text: data.question,
      option_a: data.options[0],
      option_b: data.options[1],
      option_c: data.options[2],
      option_d: data.options[3],
      correct_option: ['A', 'B', 'C', 'D'][data.correctAnswer] as 'A' | 'B' | 'C' | 'D'
    };

    try {
      console.log('Creating question:', { subjectId, data: apiData });
      const { data } = await api.post<APIQuestion>(`/questions/${subjectId}`, apiData);
      console.log('Create question response:', data);

      if (!data) {
        throw new Error('No response data');
      }

      return convertAPIQuestion(data);
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  update: async (id: string, questionData: Partial<Question>): Promise<Question> => {
    try {
      const apiData = {
        ...(questionData.question && { question_text: questionData.question }),
        ...(questionData.options && {
          option_a: questionData.options[0],
          option_b: questionData.options[1],
          option_c: questionData.options[2],
          option_d: questionData.options[3],
        }),
        ...(questionData.correctAnswer !== undefined && {
          correct_option: ['A', 'B', 'C', 'D'][questionData.correctAnswer] as 'A' | 'B' | 'C' | 'D'
        })
      };

      console.log('Updating question:', { id, data: apiData });
      const { data } = await api.put<APIQuestion>(`/questions/${id}`, apiData);
      console.log('Update question response:', data);

      if (!data) {
        throw new Error('No response data');
      }

      return convertAPIQuestion(data);
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      console.log('Deleting question:', id);
      await api.delete(`/questions/${id}`);
      console.log('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }
};
