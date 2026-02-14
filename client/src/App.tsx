import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert } from '@mui/material';

import './App.css';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import VerifyEmail from './components/VerifyEmail';
import CompleteProfile from './components/CompleteProfile';
import ErrorBoundary from './components/ErrorBoundary';
import { RoleName } from './types';

// Feature Components
import ClientDashboard from './components/client/ClientDashboard';
import ClientProfile from './components/client/ClientProfile';
import ClientTracking from './components/client/ClientTracking';
import ClientFinancials from './components/client/ClientFinancials';
import ClientAnalytics from './components/client/ClientAnalytics';
import NotificationHistory from './components/client/NotificationHistory';
import LogisticianDashboard from './components/logistician/LogisticianDashboard';
import ProcessRequestForm from './components/logistician/ProcessRequestForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import ReportsPage from './components/ReportsPage';
import LtlManagement from './components/logistician/LtlManagement';

function App() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalError = (event: PromiseRejectionEvent) => {
      const message =
        event.reason?.message ||
        event.reason?.response?.data?.message ||
        'Произошла непредвиденная ошибка';
      setError(message);
    };
    window.addEventListener('unhandledrejection', handleGlobalError);
    return () => window.removeEventListener('unhandledrejection', handleGlobalError);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/complete-profile" element={
            <ProtectedRoute allowedRoles={[RoleName.CLIENT]}>
              <ErrorBoundary>
                <CompleteProfile />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <MainLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />

            {/* Admin Routes */}
            <Route
              path="admin/*"
              element={
                <ProtectedRoute allowedRoles={[RoleName.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Logistician Routes */}
            <Route
              path="logistician/*"
              element={
                <ProtectedRoute allowedRoles={[RoleName.LOGISTICIAN]}>
                  <Routes>
                    <Route path="dashboard" element={<LogisticianDashboard />} />
                    <Route path="shipments" element={<LogisticianDashboard />} />
                    <Route path="ltl" element={<LtlManagement />} />
                    <Route path="process-request/:requestId" element={<ProcessRequestForm />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Client Routes */}
            <Route
              path="client/*"
              element={
                <ProtectedRoute allowedRoles={[RoleName.CLIENT]}>
                  <Routes>
                    <Route path="profile" element={<ClientProfile />} />
                    <Route path="requests" element={<ClientDashboard />} />
                    <Route path="dashboard" element={<Navigate to="/client/requests" replace />} />
                    <Route path="tracking" element={<ClientTracking />} />
                    <Route path="financials" element={<ClientFinancials />} />
                    <Route path="analytics" element={<ClientAnalytics />} />
                    <Route path="notifications" element={<NotificationHistory />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            <Route path="reports" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

const Home: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === RoleName.ADMIN) return <Navigate to="/admin" replace />;
  if (user?.role === RoleName.LOGISTICIAN) return <Navigate to="/logistician/dashboard" replace />;
  if (user?.role === RoleName.CLIENT) {
    if (!user.companyId) return <Navigate to="/complete-profile" replace />;
    return <Navigate to="/client/requests" replace />;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>Добро пожаловать в AXIS, {user?.username}!</h2>
      <p>Ваша роль: {user?.role}</p>
      <p>Используйте боковое меню для навигации.</p>
    </div>
  );
};

export default App;
