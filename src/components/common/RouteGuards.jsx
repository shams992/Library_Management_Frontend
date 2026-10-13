import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { LoadingBlock } from '../ui/feedback.jsx';

const ROLE_HOME = {
  admin: '/admin',
  librarian: '/librarian',
  student: '/student',
  employee: '/employee',
};

/**
 * Client-side route protection.
 * This is UX only — the API independently enforces auth, role and tenant on
 * every request, so a bypassed guard still cannot read another library's data.
 */
export const ProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, user, booting } = useAuth();
  const location = useLocation();

  if (booting) return <LoadingBlock label="Checking your session…" className="min-h-[60vh]" />;

  if (!isAuthenticated) {
    const portal = roles?.includes('admin') ? '/admin/login' : '/login';
    return <Navigate to={portal} replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }

  return children ?? <Outlet />;
};

export const GuestRoute = ({ children, redirectTo }) => {
  const { isAuthenticated, user, booting } = useAuth();
  if (booting) return <LoadingBlock label="Loading…" className="min-h-[60vh]" />;
  if (isAuthenticated) return <Navigate to={redirectTo || ROLE_HOME[user.role] || '/'} replace />;
  return children ?? <Outlet />;
};
