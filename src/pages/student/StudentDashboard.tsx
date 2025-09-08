import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Subject, ExamAttempt } from '../../types/exam';
import { subjects, results } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, BookOpen, CheckCircle, Play } from 'lucide-react';

// Helper function to assert type
function assertType<T>(data: unknown): asserts data is T {}

export function StudentDashboard() {
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [subjectsData, attemptsData] = await Promise.all([
        subjects.getAll(),
        // If results fail with 401, treat as no attempts yet
        results.getMine().catch((err) => {
          if (err instanceof Error && /validate credentials|401/i.test(err.message)) {
            console.warn('Results unauthorized; continuing without attempts');
            return [] as ExamAttempt[];
          }
          throw err;
        })
      ]);

      setSubjectList(Array.isArray(subjectsData) ? subjectsData : []);
      setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
      setSubjectList([]);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectStatus = (subjectId: string) => {
    const attempt = attempts.find(a => a.subjectId === subjectId);
    return attempt ? 'completed' : 'available';
  };

  const getSubjectAttempt = (subjectId: string) => {
    return attempts.find(a => a.subjectId === subjectId);
  };

  const handleStartExam = (subjectId: string) => {
    // Convert string ID to number since backend expects numeric IDs
    navigate(`/exam/${parseInt(subjectId)}`);
  };

  const handleViewResult = (subjectId: string) => {
    const attempt = getSubjectAttempt(subjectId);
    if (attempt) {
      navigate(`/result/${attempt.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const availableSubjects = subjectList.filter(s => getSubjectStatus(s.id) === 'available');
  const completedAttempts = attempts;

  return (
    <div className="space-y-6">
      <div>
        <h1>Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Select an exam to get started or view your results
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Available Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {(subjectList || []).filter(s => getSubjectStatus(s.id) === 'available').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed Exams</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{attempts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {attempts.length > 0 
                ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) + '%'
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Exams */}
      <div className="space-y-4">
        <h2>Available Exams</h2>
        {availableSubjects.length === 0 ? (
          <div className="text-muted-foreground">No available exam</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSubjects.map((subject) => {
              const status = getSubjectStatus(subject.id);
              const attempt = getSubjectAttempt(subject.id);
              
              return (
                <Card key={subject.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <Badge 
                        variant={status === 'completed' ? 'default' : 'secondary'}
                      >
                        {status === 'completed' ? 'Completed' : 'Available'}
                      </Badge>
                    </div>
                    <CardDescription>{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {subject.duration} minutes
                      </div>
                      <div>
                        {subject.totalQuestions} questions
                      </div>
                    </div>
                    
                    {attempt && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">Your Score: {attempt.score}/{attempt.totalQuestions}</p>
                        <p className="text-sm">Percentage: {attempt.percentage}%</p>
                        <p className="text-sm">
                          Status: {' '}
                          <span className={attempt.percentage >= subject.passingScore ? 'text-green-600' : 'text-red-600'}>
                            {attempt.percentage >= subject.passingScore ? 'Passed' : 'Failed'}
                          </span>
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleStartExam(subject.id)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Exam
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Exams */}
      <div className="space-y-4">
        <h2>Completed Exams</h2>
        {completedAttempts.length === 0 ? (
          <div className="text-muted-foreground">No completed exam</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAttempts.map((attempt) => {
              const subject = subjectList.find(s => s.id === attempt.subjectId);
              if (!subject) return null;
              return (
                <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <Badge variant="default">Completed</Badge>
                    </div>
                    <CardDescription>{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">Your Score: {attempt.score}/{attempt.totalQuestions}</p>
                      <p className="text-sm">Percentage: {attempt.percentage}%</p>
                      <p className="text-sm">
                        Status: {' '}
                        <span className={attempt.percentage >= subject.passingScore ? 'text-green-600' : 'text-red-600'}>
                          {attempt.percentage >= subject.passingScore ? 'Passed' : 'Failed'}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleViewResult(subject.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        View Result
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}