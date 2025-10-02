import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Subject, Question } from '../../types/exam';
import { subjects as subjectsApi } from '../../services/api';
import { questionService } from '../../services/questionService';

export function QuestionsTab() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [bulkQuestions, setBulkQuestions] = useState<Array<{
    question: string;
    options: [string, string, string, string];
    correctAnswer: string; // store as string to reuse RadioGroup value type
  }>>([]);
  
  // Single-edit form state
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
    setLoading(true);
    try {
      const subjects = await subjectsApi.getAll();
      setSubjects(subjects);
      if (subjects.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjects[0].id);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

    const loadQuestions = async (subjectId: string) => {
      if (!subjectId) {
        setQuestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const questions = await questionService.getBySubject(subjectId);
        setQuestions(questions);

        // Only show toast for successful loads (skip initial load)
        if (questions.length === 0) {
          // No questions found - this is normal for new subjects
        } else {
          toast.success(`Loaded ${questions.length} questions`);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        setQuestions([]);
        toast.error(error instanceof Error ? error.message : 'Failed to load questions');
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
    setBulkQuestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    setLoading(true);

    try {
      if (editingQuestion) {
        const questionData = {
          subjectId: selectedSubjectId,
          question: questionText,
          options: [option1, option2, option3, option4] as [string, string, string, string],
          correctAnswer: parseInt(correctAnswer)
        };
        await questionService.update(editingQuestion.id, questionData);
        toast.success('Question updated successfully');
      } else if (bulkQuestions.length > 0) {
        // Guard: ensure logged-in and admin
        if (!user) {
          toast.error('Please log in to continue');
          setDialogOpen(false);
          return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Your session has expired. Please log in again.');
          setDialogOpen(false);
          return;
        }

        const payloads = bulkQuestions
          .map((q) => ({
            subjectId: selectedSubjectId,
            question: q.question.trim(),
            options: [q.options[0].trim(), q.options[1].trim(), q.options[2].trim(), q.options[3].trim()] as [string, string, string, string],
            correctAnswer: parseInt(q.correctAnswer)
          }))
          // skip completely empty entries
          .filter((q) => q.question.length > 0 && q.options.every((o) => o.length > 0));

        if (payloads.length === 0) {
          toast.error('Please fill at least one complete question');
        } else {
          let successes = 0;
          let failures = 0;
          for (const data of payloads) {
            try {
              await questionService.create(selectedSubjectId, data);
              successes++;
            } catch (err) {
              failures++;
              const message = err instanceof Error ? err.message : String(err);
              if (/validate credentials|401/i.test(message)) {
                toast.error('Session expired. Please log in again.');
                setDialogOpen(false);
                break;
              }
            }
          }
          if (successes > 0) toast.success(`Created ${successes} question${successes > 1 ? 's' : ''}`);
          if (failures > 0) toast.error(`${failures} question${failures > 1 ? 's' : ''} failed to create`);
        }
      } else {
        const questionData = {
          subjectId: selectedSubjectId,
          question: questionText,
          options: [option1, option2, option3, option4] as [string, string, string, string],
          correctAnswer: parseInt(correctAnswer)
        };
        await questionService.create(selectedSubjectId, questionData);
        toast.success('Question created successfully');
      }

      setDialogOpen(false);
      resetForm();
      // Reload questions to get fresh data
      await loadQuestions(selectedSubjectId);
    } catch (error) {
      console.error('Failed to save question:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save question');
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

    const handleDeleteQuestion = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionService.delete(id.toString());
        toast.success('Question deleted successfully');
        // Refresh the questions list after deletion
        if (selectedSubjectId) {
          const questions = await questionService.getBySubject(selectedSubjectId);
          setQuestions(questions);
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question');
      }
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
              disabled={
                !selectedSubjectId ||
                (subjects.find(s => s.id === selectedSubjectId)?.totalQuestions !== undefined &&
                questions.length >= (subjects.find(s => s.id === selectedSubjectId)?.totalQuestions || 0))
              }
              onClick={() => {
                const subject = subjects.find(s => s.id === selectedSubjectId);
                if (!subject) return;
                const total = subject.totalQuestions ?? undefined;
                if (total !== undefined && questions.length >= total) {
                  toast.error('Maximum number of questions for this subject has been reached. Edit the subject to increase the limit.');
                  return;
                }
                // Initialize bulk form with remaining slots by default when creating
                if (!editingQuestion && total !== undefined) {
                  const remaining = Math.max(total - questions.length, 1);
                  setBulkQuestions(Array.from({ length: remaining }, () => ({
                    question: '',
                    options: ['', '', '', ''] as [string, string, string, string],
                    correctAnswer: '0',
                  })));
                } else {
                  setBulkQuestions([]);
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl p-0 overscroll-contain mx-4 my-3" style={{ maxHeight: '85vh', height: '85vh', overflowY: 'auto' }}>
            <div className="px-2 py-3">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? 'Edit Question' : 'Add New Questions'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingQuestion ? 'Update the question details below.' : 'Fill in the questions below. Number of forms equals remaining allowed questions for this subject.'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                {editingQuestion ? (
                  <>
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
                  </>
                ) : (
                  <>
                    {bulkQuestions.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No remaining limit detected for this subject. You can still add a single question by filling one set below after closing and reopening, or edit the subject's question limit.</div>
                    ) : null}

                    {bulkQuestions.map((q, idx) => (
                      <div key={idx} className="rounded-md border p-4 space-y-4">
                        <div className="font-medium">Question {idx + 1}</div>
                        <div className="space-y-2">
                          <Label htmlFor={`q-${idx}`}>Question</Label>
                          <Textarea
                            id={`q-${idx}`}
                            value={q.question}
                            onChange={(e) => {
                              const next = [...bulkQuestions];
                              next[idx] = { ...next[idx], question: e.target.value };
                              setBulkQuestions(next);
                            }}
                            placeholder="Enter the question text"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(['A', 'B', 'C', 'D'] as const).map((label, optIdx) => (
                            <div className="space-y-2" key={optIdx}>
                              <Label htmlFor={`q-${idx}-opt-${optIdx}`}>Option {label}</Label>
                              <Input
                                id={`q-${idx}-opt-${optIdx}`}
                                value={q.options[optIdx]}
                                onChange={(e) => {
                                  const next = [...bulkQuestions];
                                  const nextOptions = [...next[idx].options] as [string, string, string, string];
                                  nextOptions[optIdx] = e.target.value;
                                  next[idx] = { ...next[idx], options: nextOptions };
                                  setBulkQuestions(next);
                                }}
                                placeholder={`Enter option ${label}`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          <Label>Correct Answer</Label>
                          <RadioGroup
                            value={q.correctAnswer}
                            onValueChange={(val) => {
                              const next = [...bulkQuestions];
                              next[idx] = { ...next[idx], correctAnswer: val };
                              setBulkQuestions(next);
                            }}
                          >
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="0" id={`q-${idx}-ca-0`} />
                                <Label htmlFor={`q-${idx}-ca-0`}>Option A</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1" id={`q-${idx}-ca-1`} />
                                <Label htmlFor={`q-${idx}-ca-1`}>Option B</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="2" id={`q-${idx}-ca-2`} />
                                <Label htmlFor={`q-${idx}-ca-2`}>Option C</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="3" id={`q-${idx}-ca-3`} />
                                <Label htmlFor={`q-${idx}-ca-3`}>Option D</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
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
            </div>
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
            <CardDescription>
              {questions.length} / {subjects.find(s => s.id === selectedSubjectId)?.totalQuestions || '∞'} questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading questions...
              </div>
            ) : !selectedSubjectId ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a subject to view its questions
              </div>
            ) : !questions ? (
              <div className="text-center py-8 text-muted-foreground">
                Error loading questions. Please try again.
              </div>
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
                          Option {question.correctAnswer !== undefined ? String.fromCharCode(65 + (Number(question.correctAnswer) || 0)) : 'N/A'}
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
                            onClick={() => handleDeleteQuestion(Number(question.id))}
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