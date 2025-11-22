import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './auth';
import ThemeManager from './themes/ThemeManager';
import MainLayout from './layout/MainLayout';
import { modals } from './components';
import useAccessibilityAudit from './hooks/useAccessibilityAudit';
import useLenis from './hooks/useLenis';
import HomePage from './views/HomePage';

const { UsernameRequiredModal } = modals;

// Admin components (local)
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const ContentPage = React.lazy(() => import('./pages/admin/ContentPage'));
const AdminLoginPage = React.lazy(() => import('./auth/pages/LoginPage'));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage'));
const UsersPage = React.lazy(() => import('./pages/admin/UsersPage'));
const FormsPage = React.lazy(() => import('./pages/admin/FormsPage'));

// Inner component to access auth context and location
const AppContentWithRouter: React.FC = () => {
  const { requiresUsername } = useAuth();
  const location = useLocation();
  // Run accessibility audit in development mode
  useAccessibilityAudit();
  useLenis(true);
  
  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/adminsami');
  
  return (
    <>
      {/* Only show username modal on normal website, not on admin routes */}
      {!isAdminRoute && <UsernameRequiredModal isOpen={requiresUsername} />}
      <ThemeManager />
      <Routes>
          {/* Main Website Routes */}
          <Route path="/" element={<HomePage />} />

          {/* Admin Panel Routes */}
          <Route path="/adminsami/login" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
              <AdminLoginPage />
            </Suspense>
          } />

          <Route path="/adminsami" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
              <AdminLayout />
            </Suspense>
          }>
            <Route index element={
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <DashboardPage />
              </Suspense>
            } />
            <Route path="users" element={
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <UsersPage />
              </Suspense>
            } />
            <Route path="forms" element={
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <FormsPage />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <SettingsPage />
              </Suspense>
            } />
            <Route path=":contentType" element={
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <ContentPage />
              </Suspense>
            } />
          </Route>

          {/* Catch all other routes and redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </>
  );
}

// Inner component to access auth context
const AppContent: React.FC = () => {
  return (
    <Router>
      <AppContentWithRouter />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;