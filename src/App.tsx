import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ExamPage } from './pages/student/ExamPage';
import { ResultPage } from './pages/student/ResultPage';
import { Unauthorized } from './pages/Unauthorized';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={user ? (
          user.role === 'admin' ? 
          <Navigate to="/admin" replace /> : 
          <Navigate to="/dashboard" replace />
        ) : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <StudentDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/exam/:subjectId" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <ExamPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/result/:attemptId" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <ResultPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Default redirects */}
      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'admin' ? 
            <Navigate to="/admin" replace /> : 
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* 404 fallback */}
      <Route 
        path="*" 
        element={
          <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}