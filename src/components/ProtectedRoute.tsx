import { Navigate } from 'react-router-dom';
import type { JSX } from 'react';
import type { Role } from '../types';
import { useAppSelector } from '../store/hooks';
import { selectAuthLoading, selectIsAuthenticated, selectUserRole } from '../store/slices/authSlice';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const loading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectUserRole);
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;


  return children;
};

export default ProtectedRoute;