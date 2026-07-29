import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('adminUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on startup
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('adminUser');

      // If no token or stored user, skip API check
      if (!storedToken && !storedUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.success && response.data) {
          setUser(response.data);
          localStorage.setItem('adminUser', JSON.stringify(response.data));
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Helper authentication routines
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('adminUser', JSON.stringify(response.data));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('adminUser');
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume auth states
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
