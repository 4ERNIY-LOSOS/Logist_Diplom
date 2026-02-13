import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';
import { Routes, Route, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import ClientDashboard from './components/client/ClientDashboard';
import LogisticianDashboard from './components/logistician/LogisticianDashboard';
import ProcessRequestForm from './components/logistician/ProcessRequestForm';
import RegisterPage from './components/RegisterPage';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AdminDashboard } from './components/admin/AdminDashboard'; // Import the new AdminDashboard
import ReportsPage from './components/ReportsPage'; // Import ReportsPage
import LtlManagement from './components/logistician/LtlManagement';
import { Snackbar, Alert } from '@mui/material';

// ProtectedRoute component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  return token ? <>{children}</> : null;
};

// Root App component
function App() {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleGlobalError = (event: PromiseRejectionEvent) => {
        const message = event.reason?.response?.data?.message || event.reason?.message || 'An unexpected error occurred';
        setError(message);
    };
    window.addEventListener('unhandledrejection', handleGlobalError);
    return () => window.removeEventListener('unhandledrejection', handleGlobalError);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                {error}
            </Alert>
        </Snackbar>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested routes for different roles */}
            <Route index element={<Home />} />
            <Route path="admin" element={<AdminDashboard />} /> {/* New admin route */}
            <Route path="reports" element={<ReportsPage />} /> {/* New reports route */}
            <Route path="logistician/dashboard" element={<LogisticianDashboard />} />
            <Route
              path="logistician/process-request/:requestId"
              element={<ProcessRequestForm />}
            />
            <Route
              path="logistician/shipments"
              element={<LogisticianDashboard />}
            />
            <Route path="logistician/ltl" element={<LtlManagement />} />
            <Route path="client/dashboard" element={<ClientDashboard />} />
            <Route path="client/requests" element={<ClientDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

const Home: React.FC = () => {
    const { user } = useAuth();
    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Welcome to your dashboard, {user?.username}!</h2>
            <p>Your role is: {user?.role}</p>
            <p>Please use the navigation on the left to access different sections.</p>
        </div>
    );
};


export default App;
