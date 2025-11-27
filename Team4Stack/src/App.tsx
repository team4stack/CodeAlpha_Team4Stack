import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './auth';
import ThemeManager from './themes/ThemeManager';
import MainLayout from './layout/MainLayout';
import CoursesLayout from './layout/CoursesLayout';
import { modals } from './components';
import useAccessibilityAudit from './hooks/useAccessibilityAudit';
import HomePage from './modules/landing/pages/HomePage';
import CoursesPage from './modules/courses/pages/CoursesPage';
import AdmissionPage from './modules/courses/pages/AdmissionPage';
import StackStorePage from './modules/stackstore/pages/StackStorePage';
import TeamPage from './modules/team/pages/TeamPage';
import StudentPage from './modules/courses/pages/StudentPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import CookiesPolicyPage from './pages/CookiesPolicyPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ContactSupportPage from './pages/ContactSupportPage';

const { UsernameRequiredModal } = modals;

// Admin components (local)
// Landing Page Admin (/adminlandingt4s)
const AdminLayout = React.lazy(() => import('./modules/landing/admin/components/LandingAdminLayout'));
const DashboardPage = React.lazy(() => import('./modules/landing/admin/pages/DashboardPage'));
const ContentPage = React.lazy(() => import('./modules/landing/admin/pages/ContentPage'));
const SettingsPage = React.lazy(() => import('./modules/landing/admin/pages/SettingsPage'));
const UsersPage = React.lazy(() => import('./modules/landing/admin/pages/UsersPage'));
const FormsPage = React.lazy(() => import('./modules/landing/admin/pages/FormsPage'));
const AdminLoginPage = React.lazy(() => import('./auth/pages/LoginPage'));

// Courses Admin (/admincourset4s)
const CoursesAdminPanel = React.lazy(() => import('./modules/courses/admin/pages/CoursesAdminDashboard'));

// StackStore Admin (/adminstackt4s)
const StackStoreAdminLayout = React.lazy(() => import('./modules/stackstore/admin/components/StackStoreAdminLayout'));
const StackStoreAdminDashboard = React.lazy(() => import('./modules/stackstore/admin/pages/StackStoreAdminDashboard'));
const StackStoreAdminLoginPage = React.lazy(() => import('./auth/pages/StackStoreAdminLoginPage'));

// Team Admin (/adminteamt4s)
const TeamAdminLayout = React.lazy(() => import('./modules/team/admin/components/TeamAdminLayout'));
const TeamAdminDashboard = React.lazy(() => import('./modules/team/admin/pages/TeamAdminDashboard'));
const TeamAdminLoginPage = React.lazy(() => import('./auth/pages/TeamAdminLoginPage'));

// Super Admin (/supadmin)
const SuperAdminLayout = React.lazy(() => import('./modules/superadmin/components/SuperAdminLayout'));
const SuperAdminDashboard = React.lazy(() => import('./modules/superadmin/pages/SuperAdminDashboard'));
const SuperAdminLoginPage = React.lazy(() => import('./auth/pages/SuperAdminLoginPage'));
const CourseListPage = React.lazy(() => import('./modules/courses/pages/CourseListPage'));
const CourseViewPage = React.lazy(() => import('./modules/courses/pages/CourseViewPage'));

// Inner component to access auth context and location
const AppContentWithRouter: React.FC = () => {
  const { requiresUsername } = useAuth();
  const location = useLocation();
  // Run accessibility audit in development mode
  useAccessibilityAudit();
  
  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/adminlandingt4s') || location.pathname.startsWith('/admincourset4s') || location.pathname.startsWith('/adminstackt4s') || location.pathname.startsWith('/adminteamt4s') || location.pathname.startsWith('/supadmin');
  
  return (
    <>
      {/* Only show username modal on normal website, not on admin routes */}
      {!isAdminRoute && <UsernameRequiredModal isOpen={requiresUsername} />}
      <ThemeManager />
      <Routes>
          {/* Main Website Routes */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />

          {/* StackStore Page Route */}
          <Route path="/stackstore" element={<MainLayout><StackStorePage /></MainLayout>} />

          {/* Team Page Route */}
          <Route path="/team" element={<MainLayout><TeamPage /></MainLayout>} />

          {/* Footer Links Pages */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsConditionsPage />} />
          <Route path="/cookies" element={<CookiesPolicyPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/contact" element={<ContactSupportPage />} />

          {/* Courses area with its own navbar layout */}
          <Route path="/courses" element={<CoursesLayout><CoursesPage /></CoursesLayout>} />
          <Route path="/courses/apply" element={<CoursesLayout><AdmissionPage /></CoursesLayout>} />
          <Route path="/student" element={<CoursesLayout><StudentPage /></CoursesLayout>} />
          <Route path="/student/courses" element={
            <CoursesLayout>
              <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <CourseListPage />
              </Suspense>
            </CoursesLayout>
          } />
          <Route path="/student/courses/view/:courseId" element={
            <CoursesLayout>
              <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <CourseViewPage />
              </Suspense>
            </CoursesLayout>
          } />

          {/* Courses Admin Panel Route (Separate) */}
          <Route path="/admincourset4s" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
              <CoursesAdminPanel />
            </Suspense>
          } />

          {/* StackStore Admin Panel Routes */}
          <Route path="/adminstackt4s/login" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
              <StackStoreAdminLoginPage />
            </Suspense>
          } />

          <Route path="/adminstackt4s" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
              <StackStoreAdminLayout />
            </Suspense>
          }>
            <Route index element={
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <StackStoreAdminDashboard />
              </Suspense>
            } />
            {/* Placeholder routes for future implementation */}
            <Route path="products" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Products Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Product management feature coming soon...</p>
              </div>
            } />
            <Route path="categories" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Categories Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Category management feature coming soon...</p>
              </div>
            } />
            <Route path="orders" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Orders Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Order management feature coming soon...</p>
              </div>
            } />
            <Route path="sellers" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Sellers Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Seller management feature coming soon...</p>
              </div>
            } />
            <Route path="settings" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">StackStore Settings</h2>
                <p className="text-gray-600 dark:text-gray-400">Settings feature coming soon...</p>
              </div>
            } />
          </Route>

          {/* Team Admin Panel Routes */}
          <Route path="/adminteamt4s/login" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
              <TeamAdminLoginPage />
            </Suspense>
          } />

          <Route path="/adminteamt4s" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
              <TeamAdminLayout />
            </Suspense>
          }>
            <Route index element={
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                <TeamAdminDashboard />
              </Suspense>
            } />
            {/* Placeholder routes for future implementation */}
            <Route path="members" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Team Members Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Team member management feature coming soon...</p>
              </div>
            } />
            <Route path="mentor" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Mentor Profile Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Mentor profile management feature coming soon...</p>
              </div>
            } />
            <Route path="roles" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Roles & Positions</h2>
                <p className="text-gray-600 dark:text-gray-400">Role management feature coming soon...</p>
              </div>
            } />
            <Route path="settings" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Team Settings</h2>
                <p className="text-gray-600 dark:text-gray-400">Settings feature coming soon...</p>
              </div>
            } />
          </Route>

          {/* Super Admin Panel Routes */}
          <Route path="/supadmin/login" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
              <SuperAdminLoginPage />
            </Suspense>
          } />

          <Route path="/supadmin" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
              <SuperAdminLayout />
            </Suspense>
          }>
            <Route index element={
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <SuperAdminDashboard />
              </Suspense>
            } />
            {/* Placeholder routes for future implementation */}
            <Route path="roles" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Role Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Role management feature coming soon...</p>
              </div>
            } />
            <Route path="users" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">All Users</h2>
                <p className="text-gray-600 dark:text-gray-400">User management feature coming soon...</p>
              </div>
            } />
            <Route path="admins" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Admin Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Admin management feature coming soon...</p>
              </div>
            } />
            <Route path="system" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">System Settings</h2>
                <p className="text-gray-600 dark:text-gray-400">System settings feature coming soon...</p>
              </div>
            } />
            <Route path="audit" element={
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Audit Logs</h2>
                <p className="text-gray-600 dark:text-gray-400">Audit logs feature coming soon...</p>
              </div>
            } />
          </Route>

          {/* Landing Page Admin Panel Routes */}
          <Route path="/adminlandingt4s/login" element={
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
              <AdminLoginPage />
            </Suspense>
          } />

          <Route path="/adminlandingt4s" element={
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
            <Route path="courses" element={
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
                <CoursesAdminPanel />
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
