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

// Placeholder components for different dashboards
const AdminDashboard: React.FC = () => <div>Admin Dashboard Content</div>;

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
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
            <Route path="admin/users" element={<AdminDashboard />} />
            <Route path="admin/companies" element={<AdminDashboard />} />
            <Route path="logistician/dashboard" element={<LogisticianDashboard />} />
            <Route
              path="logistician/process-request/:requestId"
              element={<ProcessRequestForm />}
            />
            <Route
              path="logistician/shipments"
              element={<LogisticianDashboard />}
            />
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