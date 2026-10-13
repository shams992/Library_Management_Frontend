import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { ProtectedRoute, GuestRoute } from './components/common/RouteGuards.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { LoadingBlock } from './components/ui/feedback.jsx';
import { TooltipProvider } from './components/ui/misc.jsx';

// Auth pages
import AdminLoginPage from './pages/auth/AdminLoginPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import AccessDeniedPage from './pages/shared/AccessDeniedPage.jsx';

// Admin console pages (lazy loaded)
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage.jsx'));
const AdminLibraries = lazy(() => import('./pages/admin/LibrariesPage.jsx'));
const AdminLibraryDetail = lazy(() => import('./pages/admin/LibraryDetailPage.jsx'));
const AdminStudents = lazy(() => import('./pages/admin/StudentsPage.jsx'));
const AdminSubscriptions = lazy(() => import('./pages/admin/SubscriptionsPage.jsx'));
const AdminBillingControls = lazy(() => import('./pages/admin/BillingControlsPage.jsx'));
const AdminPayments = lazy(() => import('./pages/admin/PaymentsPage.jsx'));
const AdminMessages = lazy(() => import('./pages/admin/MessagesPage.jsx'));
const AdminReports = lazy(() => import('./pages/admin/ReportsPage.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/SettingsPage.jsx'));
const NotificationsCentre = lazy(() => import('./pages/shared/NotificationsPage.jsx'));

const withSuspense = (element) => (
  <Suspense fallback={<LoadingBlock className="min-h-[60vh]" label="Loading…" />}>
    {element}
  </Suspense>
);

/** Transparently forwards legacy /admin/* URLs to /* root routes */
function AdminLegacyRedirect() {
  const location = useLocation();
  const subpath = location.pathname.replace(/^\/admin/, '') || '/';
  return <Navigate to={`${subpath}${location.search}`} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={150}>
        <Routes>
          {/* ── Admin Auth ────────────────────────────────────────────── */}
          <Route
            element={
              <GuestRoute redirectTo="/">
                <AuthLayout
                  title="Platform Administration"
                  subtitle="Sign in to platform control and manage all libraries."
                />
              </GuestRoute>
            }
          >
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* ── Access Denied for non-admin accounts ───────────────────── */}
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* ── Platform Admin Console ─────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={withSuspense(<AdminDashboard />)} />
              <Route path="/libraries" element={withSuspense(<AdminLibraries />)} />
              <Route path="/libraries/:id" element={withSuspense(<AdminLibraryDetail />)} />
              <Route path="/students" element={withSuspense(<AdminStudents />)} />
              <Route path="/subscriptions" element={withSuspense(<AdminSubscriptions />)} />
              <Route path="/subscriptions/controls" element={withSuspense(<AdminBillingControls />)} />
              <Route path="/payments" element={withSuspense(<AdminPayments />)} />
              <Route path="/messages" element={withSuspense(<AdminMessages />)} />
              <Route path="/reports" element={withSuspense(<AdminReports />)} />
              <Route path="/settings" element={withSuspense(<AdminSettings />)} />
              <Route path="/notifications" element={withSuspense(<NotificationsCentre />)} />
            </Route>
          </Route>

          {/* ── Legacy /admin/* redirects to preserve any deep links ───── */}
          <Route path="/admin" element={<Navigate to="/" replace />} />
          <Route path="/admin/*" element={<AdminLegacyRedirect />} />

          {/* ── Fallback ──────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
