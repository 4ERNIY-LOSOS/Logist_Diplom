import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  username: string;
  sub: string; // userId
  role: string;
  exp: number; // expiration time
}

interface AuthContextType {
  token: string | null;
  user: { username: string; userId: string; role: string } | null;
  login: (newToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('jwt_token');
    return storedToken;
  });

  const [user, setUser] = useState<{ username: string; userId: string; role: string } | null>(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      try {
        const decoded: DecodedToken = jwtDecode(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          return { username: decoded.username, userId: decoded.sub, role: decoded.role };
        }
      } catch (error) {
        console.error('Failed to decode stored token:', error);
      }
    }
    return null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ username: decoded.username, userId: decoded.sub, role: decoded.role });
        } else {
          // Token expired, log out
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to decode new token:', error);
        setToken(null);
        setUser(null);
      }
    } else {
      localStorage.removeItem('jwt_token');
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
