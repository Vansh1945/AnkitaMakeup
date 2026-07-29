import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated || !isAdmin) {
    // Redirect to login page if not authenticated or not admin
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
