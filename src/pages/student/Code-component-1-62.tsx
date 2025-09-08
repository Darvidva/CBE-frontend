import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { ExamSession } from '../../types/exam';
import { examApi, subjectApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export function ExamPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (subjectId && user) {
      startExam();
    }
  }, [subjectId, user]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(time => {
          const newTime = time - 1;
          if (newTime <= 0) {
            handleSubmitExam(true); // Auto-submit when time runs out
          }
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const startExam = async () => {
    if (!subjectId || !user) return;
    
    setLoading(true);
    try {
      const session = await examApi.startExam(subjectId, user.id);
      setExamSession(session);
      setTimeRemaining(session.timeRemaining);
    } catch (error) {
      console.error('Failed to start exam:', error);
      setError('Failed to start exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answerIndex: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(answerIndex)
    }));
  };

  const handleSubmitExam = async (autoSubmit = false) => {
    if (!examSession) return;

    if (!autoSubmit) {
      const confirmed = confirm('Are you sure you want to submit your exam? This action cannot be undone.');
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      const result = await examApi.submitExam(examSession.id, answers);
      navigate(`/result/${result.id}`);
    } catch (error) {
      console.error('Failed to submit exam:', error);
      setError('Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (timeRemaining / (examSession?.timeRemaining || 1)) * 100;
    if (percentage <= 10) return 'text-red-600';
    if (percentage <= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getTotalQuestions = () => {
    return examSession?.questions.length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!examSession) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p>Exam session not found.</p>
      </div>
    );
  }

  const currentQuestion = examSession.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / examSession.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Timer and Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exam in Progress</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {examSession.questions.length}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-2 ${getTimeColor()}`}>
                <Clock className="h-4 w-4" />
                <span className="text-lg">{formatTime(timeRemaining)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {getAnsweredCount()}/{getTotalQuestions()} answered
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          {timeRemaining <= 300 && ( // Show warning when 5 minutes left
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: Only {Math.ceil(timeRemaining / 60)} minutes remaining!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Question {currentQuestionIndex + 1}
            </Badge>
            {answers[currentQuestion.id] !== undefined && (
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Answered
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3>{currentQuestion.question}</h3>
          </div>
          
          <RadioGroup
            value={answers[currentQuestion.id]?.toString() || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  <span className="mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation and Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {currentQuestionIndex < examSession.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmitExam(false)}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="destructive"
                onClick={() => handleSubmitExam(false)}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Early'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {examSession.questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? 'default' : 'outline'}
                size="sm"
                className={`aspect-square p-0 ${
                  answers[examSession.questions[index].id] !== undefined 
                    ? 'ring-2 ring-green-500' 
                    : ''
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}