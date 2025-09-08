import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Subject, ExamAttempt } from '../../types/exam';
import { subjectApi, examApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, BookOpen, CheckCircle, Play } from 'lucide-react';

export function StudentDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectsData, attemptsData] = await Promise.all([
        subjectApi.getAll(),
        examApi.getStudentResults(user?.id || '')
      ]);
      setSubjects(subjectsData);
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Failed to load data:', error);
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
    navigate(`/exam/${subjectId}`);
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

  return (
    <div className="space-y-6">
      <div>
        <h1>Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Select an exam to get started or view your results
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Available Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {subjects.filter(s => getSubjectStatus(s.id) === 'available').length}
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
        {subjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No exams available at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
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
                      {status === 'available' ? (
                        <Button 
                          onClick={() => handleStartExam(subject.id)}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Exam
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleViewResult(subject.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          View Result
                        </Button>
                      )}
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