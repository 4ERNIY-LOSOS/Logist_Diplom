import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';
import { Role } from '../types';
import { authService } from '../services/auth.service';

interface AuthUser {
  userId: string;
  username: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLogistician: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decoded: { sub: string; username: string; role: Role } = jwtDecode(token);
        setUser({ userId: decoded.sub, username: decoded.username, role: decoded.role });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error("Invalid token on session restore", e);
        localStorage.removeItem('jwt_token');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password);
    const { access_token } = response;
    
    if (access_token) {
      localStorage.setItem('jwt_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      const decoded: { sub: string; username: string; role: Role } = jwtDecode(access_token);
      setUser({ userId: decoded.sub, username: decoded.username, role: decoded.role });
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === Role.ADMIN,
    isLogistician: user?.role === Role.LOGISTICIAN,
    isClient: user?.role === Role.CLIENT,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
