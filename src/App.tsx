import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDetail } from './pages/StudentDetail';
import { Lightbox } from './components/Lightbox';

export const App: React.FC = () => {
  // Authentication state
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('yogurt-session-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (sessionUser: any) => {
    localStorage.setItem('yogurt-session-user', JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const logout = () => {
    localStorage.removeItem('yogurt-session-user');
    setUser(null);
  };

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('yogurt-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yogurt-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <BrowserRouter>
      {/* Theme Toggle Button */}
      <button 
        type="button" 
        id="theme-toggle" 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
        title={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      >
        <span className="theme-toggle-icon" id="theme-toggle-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5" style={{ width: '14px', height: '14px' }} />
          ) : (
            <Sun className="w-3.5 h-3.5" style={{ width: '14px', height: '14px' }} />
          )}
        </span>
        <span className="theme-toggle-text" id="theme-toggle-text" style={{ textTransform: 'capitalize' }}>
          {theme}
        </span>
      </button>

      {/* Main Application Routes */}
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to={user.role === 'guru' ? '/teacher' : '/student'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={user.role === 'guru' ? '/teacher' : '/student'} replace />
            ) : (
              <Login onLoginSuccess={login} />
            )
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/student" 
          element={
            user && user.role === 'siswa' ? (
              <StudentDashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/student/stage/:stageParam" 
          element={
            user && user.role === 'siswa' ? (
              <StudentDashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Teacher Routes */}
        <Route 
          path="/teacher" 
          element={
            user && user.role === 'guru' ? (
              <TeacherDashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/teacher/student/:username" 
          element={
            user && user.role === 'guru' ? (
              <StudentDetail user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Photo Zoom Lightbox Modal */}
      <Lightbox />
    </BrowserRouter>
  );
};

export default App;
