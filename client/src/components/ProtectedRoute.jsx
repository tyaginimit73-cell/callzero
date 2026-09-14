import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingScreen from './ui/LoadingScreen.jsx';

export function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Checking your session..." />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
