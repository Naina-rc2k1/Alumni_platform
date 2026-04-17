import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  const normalizeRole = (role) => {
    if (role === 'student') return 'currentStudent';
    return role;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRole = normalizeRole(user?.role);
    if (userRole !== requiredRole) return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
