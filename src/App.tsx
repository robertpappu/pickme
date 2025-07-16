import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfficerAuthProvider } from './contexts/OfficerAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout/Layout';
import { LoadingSpinner } from './components/UI/LoadingSpinner';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Officers } from './pages/Officers';
import { OfficerRegistrations } from './pages/OfficerRegistrations';
import { QueryHistory } from './pages/QueryHistory';
import { Credits } from './pages/Credits';
import { APIManagement } from './pages/APIManagement';
import { LiveRequests } from './pages/LiveRequests';
import { Settings } from './pages/Settings';
import { RatePlans } from './pages/RatePlans';
import { OfficerLogin } from './pages/OfficerLogin';
import { OfficerDashboard } from './pages/OfficerDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={user ? <Navigate to="/admin/dashboard" replace /> : <Login />} />
        <Route path="/admin/signup" element={user ? <Navigate to="/admin/dashboard" replace /> : <SignUp />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/officers" element={
          <ProtectedRoute>
            <Layout>
              <Officers />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/registrations" element={
          <ProtectedRoute>
            <Layout>
              <OfficerRegistrations />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/queries" element={
          <ProtectedRoute>
            <Layout>
              <QueryHistory />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/credits" element={
          <ProtectedRoute>
            <Layout>
              <Credits />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/rate-plans" element={
          <ProtectedRoute>
            <Layout>
              <RatePlans />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/apis" element={
          <ProtectedRoute>
            <Layout>
              <APIManagement />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/live" element={
          <ProtectedRoute>
            <Layout>
              <LiveRequests />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Officer Routes */}
        <Route path="/officer/login" element={<OfficerLogin />} />
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />

        {/* Legacy Routes (redirect to admin) */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/signup" element={<Navigate to="/admin/signup" replace />} />
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/officers" element={<Navigate to="/admin/officers" replace />} />
        <Route path="/queries" element={<Navigate to="/admin/queries" replace />} />
        <Route path="/credits" element={<Navigate to="/admin/credits" replace />} />
        <Route path="/apis" element={<Navigate to="/admin/apis" replace />} />
        <Route path="/live" element={<Navigate to="/admin/live" replace />} />
        <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

        {/* Redirects */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/officer" element={<Navigate to="/officer/login" replace />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid #00B7B8',
          },
        }}
      />
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OfficerAuthProvider>
          <div className="min-h-screen font-cyber" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <AppContent />
          </div>
        </OfficerAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;