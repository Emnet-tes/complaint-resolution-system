import { Navigate } from 'react-router-dom';
import { useAuth, type Role } from '../context/AuthContext';
import type { JSX } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;


  return children;
};

export default ProtectedRoute;