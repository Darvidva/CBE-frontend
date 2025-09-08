import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Subject, Question } from '../../types/exam';
import { subjectApi, questionApi } from '../../services/api';

export function QuestionsTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  // Form state
  const [questionText, setQuestionText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('0');

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadQuestions(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    try {
      const data = await subjectApi.getAll();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const loadQuestions = async (subjectId: string) => {
    setLoading(true);
    try {
      const data = await questionApi.getBySubjectId(subjectId);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectAnswer('0');
    setEditingQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    setLoading(true);

    try {
      const questionData = {
        subjectId: selectedSubjectId,
        question: questionText,
        options: [option1, option2, option3, option4] as [string, string, string, string],
        correctAnswer: parseInt(correctAnswer)
      };

      if (editingQuestion) {
        await questionApi.update(editingQuestion.id, questionData);
      } else {
        await questionApi.create(questionData);
      }

      await loadQuestions(selectedSubjectId);
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setQuestionText(question.question);
    setOption1(question.options[0]);
    setOption2(question.options[1]);
    setOption3(question.options[2]);
    setOption4(question.options[3]);
    setCorrectAnswer(question.correctAnswer.toString());
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    setLoading(true);
    try {
      await questionApi.delete(id);
      if (selectedSubjectId) {
        await loadQuestions(selectedSubjectId);
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Questions</h2>
          <p className="text-muted-foreground">Manage exam questions for each subject</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2"
              disabled={!selectedSubjectId}
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question text"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-4">
                <Label>Answer Options</Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="option1">Option A</Label>
                    <Input
                      id="option1"
                      value={option1}
                      onChange={(e) => setOption1(e.target.value)}
                      placeholder="Enter option A"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="option2">Option B</Label>
                    <Input
                      id="option2"
                      value={option2}
                      onChange={(e) => setOption2(e.target.value)}
                      placeholder="Enter option B"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="option3">Option C</Label>
                    <Input
                      id="option3"
                      value={option3}
                      onChange={(e) => setOption3(e.target.value)}
                      placeholder="Enter option C"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="option4">Option D</Label>
                    <Input
                      id="option4"
                      value={option4}
                      onChange={(e) => setOption4(e.target.value)}
                      placeholder="Enter option D"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Correct Answer</Label>
                <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="correct-a" />
                    <Label htmlFor="correct-a">Option A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="correct-b" />
                    <Label htmlFor="correct-b">Option B</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="correct-c" />
                    <Label htmlFor="correct-c">Option C</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="correct-d" />
                    <Label htmlFor="correct-d">Option D</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingQuestion ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Selection</CardTitle>
          <CardDescription>
            Select a subject to view and manage its questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="subject-select">Subject</Label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedSubjectId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Questions for {subjects.find(s => s.id === selectedSubjectId)?.name}
            </CardTitle>
            <CardDescription>
              Manage all questions for this subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && questions.length === 0 ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No questions found for this subject. Create your first question to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Correct Answer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="max-w-md">
                        <div className="truncate">{question.question}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {question.options.map((option, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">
                                {String.fromCharCode(65 + index)}:
                              </span>{' '}
                              {option}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Option {String.fromCharCode(65 + question.correctAnswer)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(question.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}