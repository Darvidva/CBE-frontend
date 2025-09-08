import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ExamAttempt } from '../../types/exam';
import { examApi } from '../../services/api';
import { Search } from 'lucide-react';

export function ResultsTab() {
  const [results, setResults] = useState<ExamAttempt[]>([]);
  const [filteredResults, setFilteredResults] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    const search = (searchTerm || '').toLowerCase();
    const filtered = results.filter((result: any) => {
      const studentName = (result.studentName ?? '').toLowerCase();
      const subjectName = (result.subjectName ?? '').toLowerCase();
      const subjectIdStr = String(result.subjectId ?? result.subject_id ?? '').toLowerCase();
      const studentIdStr = String(result.studentId ?? result.student_id ?? '').toLowerCase();
      return (
        studentName.includes(search) ||
        subjectName.includes(search) ||
        subjectIdStr.includes(search) ||
        studentIdStr.includes(search)
      );
    });
    setFilteredResults(filtered as any);
  }, [results, searchTerm]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await examApi.getAllResults();
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (percentage: number, passingScore = 70) => {
    const isPassed = percentage >= passingScore;
    return (
      <Badge variant={isPassed ? 'default' : 'destructive'}>
        {isPassed ? 'Passed' : 'Failed'}
      </Badge>
    );
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const calculateStats = () => {
    if (filteredResults.length === 0) return { total: 0, passed: 0, failed: 0, average: 0 };
    
    const total = filteredResults.length;
    const passed = filteredResults.filter(r => r.percentage >= 70).length;
    const failed = total - passed;
    const average = Math.round(
      filteredResults.reduce((sum, r) => sum + r.percentage, 0) / total
    );

    return { total, passed, failed, average };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div>
        <h2>Exam Results</h2>
        <p className="text-muted-foreground">
          View and analyze student exam performance
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.passed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.average}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Results */}
      <Card>
        <CardHeader>
          <CardTitle>All Results</CardTitle>
          <CardDescription>
            Complete list of exam attempts and scores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <Label htmlFor="search">Search Results</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or subject"
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading results...</div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No results match your search.' : 'No exam results found.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result: any) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.studentName || result.student_name || `Student #${result.studentId ?? result.student_id ?? '-'}`}</TableCell>
                    <TableCell>{result.subjectName || result.subject_name || `Subject #${result.subjectId ?? result.subject_id ?? '-'}`}</TableCell>
                    <TableCell>
                      {result.score}/{result.totalQuestions ?? result.total ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.percentage ?? 0}%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getGrade(result.percentage ?? 0)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(result.percentage ?? 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}