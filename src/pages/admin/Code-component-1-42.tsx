import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { SubjectsTab } from './SubjectsTab';
import { QuestionsTab } from './QuestionsTab';
import { ResultsTab } from './ResultsTab';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('subjects');

  return (
    <div className="space-y-6">
      <div>
        <h1>Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage subjects, questions, and view exam results
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-6">
          <SubjectsTab />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <QuestionsTab />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <ResultsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}