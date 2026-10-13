import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { LoadingBlock } from '../ui/feedback.jsx';

/**
 * Admin App Route Guards:
 * - Only users with role === 'admin' can access admin routes.
 * - Authenticated non-admin users are sent to /access-denied.
 * - Unauthenticated users are sent to /login.
 */
export const ProtectedRoute = ({ roles = ['admin'], children }) => {
  const { isAuthenticated, user, booting } = useAuth();
  const location = useLocation();

  if (booting) return <LoadingBlock label="Checking administrator session…" className="min-h-[60vh]" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/access-denied" replace />;
  }

  return children ?? <Outlet />;
};

export const GuestRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, user, booting } = useAuth();
  if (booting) return <LoadingBlock label="Loading…" className="min-h-[60vh]" />;

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to={redirectTo} replace />;
    }
    return <Navigate to="/access-denied" replace />;
  }

  return children ?? <Outlet />;
};
