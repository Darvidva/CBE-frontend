import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Mock API call - replace with real endpoint
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Mock response structure
      const mockUser = {
        id: email === 'admin@exam.com' ? 'admin1' : 'student1',
        name: email === 'admin@exam.com' ? 'Admin User' : 'Student User',
        email,
        role: email === 'admin@exam.com' ? 'admin' as UserRole : 'student' as UserRole
      };
      const mockToken = 'mock_jwt_token_' + Date.now();

      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      // For demo purposes, allow login with any credentials
      const mockUser = {
        id: email === 'admin@exam.com' ? 'admin1' : 'student1',
        name: email === 'admin@exam.com' ? 'Admin User' : 'Student User',
        email,
        role: email === 'admin@exam.com' ? 'admin' as UserRole : 'student' as UserRole
      };
      const mockToken = 'mock_jwt_token_' + Date.now();

      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Mock API call - replace with real endpoint
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const mockUser = {
        id: 'student_' + Date.now(),
        name,
        email,
        role: 'student' as UserRole
      };
      const mockToken = 'mock_jwt_token_' + Date.now();

      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      // For demo, allow any signup
      const mockUser = {
        id: 'student_' + Date.now(),
        name,
        email,
        role: 'student' as UserRole
      };
      const mockToken = 'mock_jwt_token_' + Date.now();

      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}