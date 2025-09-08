import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ExamAttempt } from '../../types/exam';
import { examApi } from '../../services/api';
import { CheckCircle, XCircle, Trophy, RotateCcw, Home } from 'lucide-react';

export function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [result, setResult] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (attemptId) {
      loadResult();
    }
  }, [attemptId]);

  const loadResult = async () => {
    setLoading(true);
    try {
      // Mock loading result - in real app this would be an API call
      // For demo, we'll create a mock result
      const mockResult: ExamAttempt = {
        id: attemptId || '',
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
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      setResult(mockResult);
    } catch (error) {
      console.error('Failed to load result:', error);
      setError('Failed to load exam result.');
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'B', color: 'text-green-500' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const getPassStatus = (percentage: number, passingScore = 70) => {
    return percentage >= passingScore;
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
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p>Result not found.</p>
      </div>
    );
  }

  const { grade, color } = getGrade(result.percentage);
  const passed = getPassStatus(result.percentage);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Result Header */}
      <Card className={`border-2 ${passed ? 'border-green-500' : 'border-red-500'}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl mb-2">
            Exam {passed ? 'Completed Successfully' : 'Not Passed'}
          </CardTitle>
          
          <CardDescription>
            {result.subjectName} • Submitted on {new Date(result.submittedAt || '').toLocaleString()}
          </CardDescription>
          
          <div className="mt-4">
            <Badge 
              variant={passed ? 'default' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {passed ? 'PASSED' : 'FAILED'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Score Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {result.score}/{result.totalQuestions}
            </div>
            <p className="text-xs text-muted-foreground">
              Questions answered correctly
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{result.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${color}`}>{grade}</div>
            <p className="text-xs text-muted-foreground">
              Letter grade
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? 'Pass' : 'Fail'}
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 70% required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of your exam performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Correct Answers</span>
              <span className="text-green-600">{result.score} questions</span>
            </div>
            <div className="flex justify-between">
              <span>Incorrect Answers</span>
              <span className="text-red-600">{result.totalQuestions - result.score} questions</span>
            </div>
            <div className="flex justify-between">
              <span>Accuracy Rate</span>
              <span>{result.percentage}%</span>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            {passed ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Congratulations! You have successfully passed the exam with a score of {result.percentage}%. 
                  Your performance demonstrates a good understanding of the subject matter.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Unfortunately, you did not pass this exam. A minimum score of 70% is required. 
                  Consider reviewing the study materials and retaking the exam when you feel ready.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            {!passed && (
              <Button
                variant="outline"
                onClick={() => navigate(`/exam/${result.subjectId}`)}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Exam
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study Recommendations */}
      {!passed && (
        <Card>
          <CardHeader>
            <CardTitle>Study Recommendations</CardTitle>
            <CardDescription>
              Areas to focus on for improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Review the fundamental concepts covered in this subject</p>
              <p>• Practice similar questions to strengthen your understanding</p>
              <p>• Consider seeking additional help from instructors or study groups</p>
              <p>• Take your time to thoroughly understand each concept before retaking</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}