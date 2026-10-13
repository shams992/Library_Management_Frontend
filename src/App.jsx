import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { AuthLayout } from './layouts/AuthLayout.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { ProtectedRoute, GuestRoute } from './components/common/RouteGuards.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { LoadingBlock } from './components/ui/feedback.jsx';
import { TooltipProvider } from './components/ui/misc.jsx';
import { useAuth } from './hooks/useAuth.js';
import { PORTAL_ROOT } from './utils/navigation.js';

// ── Public ──────────────────────────────────────────────────────────────
import { LandingPage } from './pages/public/LandingPage.jsx';
import LibrariesPage from './pages/public/LibrariesPage.jsx';
import LibraryDetailPage from './pages/public/LibraryDetailPage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import { TermsPage, PrivacyPage, NotFoundPage } from './pages/public/LegalPages.jsx';

// ── Auth ────────────────────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage.jsx';
import AdminLoginPage from './pages/auth/AdminLoginPage.jsx';
import RegisterLibraryPage from './pages/auth/RegisterLibraryPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';

// ── Librarian (code-split: the dashboard bundle stays out of the landing page) ──
const LibrarianDashboard = lazy(() => import('./pages/librarian/DashboardPage.jsx'));
const StudentsPage = lazy(() => import('./pages/librarian/StudentsPage.jsx'));
const StudentDetailPage = lazy(() => import('./pages/librarian/StudentDetailPage.jsx'));
const SeatsPage = lazy(() => import('./pages/librarian/SeatsPage.jsx'));
const FeesPage = lazy(() => import('./pages/librarian/FeesPage.jsx'));
const FeeHistoryPage = lazy(() => import('./pages/librarian/FeeHistoryPage.jsx'));
const EmployeesPage = lazy(() => import('./pages/librarian/EmployeesPage.jsx'));
const EmployeeDetailPage = lazy(() => import('./pages/librarian/EmployeeDetailPage.jsx'));
const SalariesPage = lazy(() => import('./pages/librarian/SalariesPage.jsx'));
const AttendancePage = lazy(() => import('./pages/librarian/AttendancePage.jsx'));
const IncomePage = lazy(() => import('./pages/librarian/IncomePage.jsx'));
const ExpensesPage = lazy(() => import('./pages/librarian/ExpensesPage.jsx'));
const ProfitPage = lazy(() => import('./pages/librarian/ProfitPage.jsx'));
const ReportsPage = lazy(() => import('./pages/librarian/ReportsPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/shared/NotificationsPage.jsx'));
const MessagesPage = lazy(() => import('./pages/librarian/MessagesPage.jsx'));
const LibrarySettingsPage = lazy(() => import('./pages/librarian/LibrarySettingsPage.jsx'));
const SubscriptionPage = lazy(() => import('./pages/librarian/SubscriptionPage.jsx'));
const LibrarianProfilePage = lazy(() => import('./pages/librarian/ProfilePage.jsx'));

// ── Admin ───────────────────────────────────────────────────────────────
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

// ── Portals ─────────────────────────────────────────────────────────────
const StudentDashboard = lazy(() => import('./pages/student/DashboardPage.jsx'));
const StudentFees = lazy(() => import('./pages/student/FeesPage.jsx'));
const StudentSeat = lazy(() => import('./pages/student/SeatPage.jsx'));
const StudentProfile = lazy(() => import('./pages/student/ProfilePage.jsx'));
const EmployeeDashboard = lazy(() => import('./pages/employee/DashboardPage.jsx'));
const EmployeeSalary = lazy(() => import('./pages/employee/SalaryPage.jsx'));
const EmployeeAttendance = lazy(() => import('./pages/employee/AttendancePage.jsx'));
const NotificationsCentre = lazy(() => import('./pages/shared/NotificationsPage.jsx'));

const withSuspense = (element) => <Suspense fallback={<LoadingBlock className="min-h-[60vh]" label="Loading…" />}>{element}</Suspense>;

const PortalRedirect = () => {
  const { user, isAuthenticated, booting } = useAuth();
  if (booting) return <LoadingBlock className="min-h-[60vh]" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={PORTAL_ROOT[user.role] || '/'} replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={150}>
        <Routes>
        {/* ── Public site ─────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/libraries" element={<LibrariesPage />} />
          <Route path="/libraries/:id" element={<LibraryDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>

        {/* ── Auth ────────────────────────────────────────────────── */}
        <Route
          element={
            <GuestRoute>
              <AuthLayout
                title="Welcome back"
                subtitle="Sign in to manage students, seats, fees and finances."
              />
            </GuestRoute>
          }
        >
          <Route path="/login" element={<LoginPage portal="librarian" />} />
          <Route path="/student/login" element={<LoginPage portal="student" showPortalTabs={false} />} />
          <Route path="/employee/login" element={<LoginPage portal="employee" showPortalTabs={false} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route
          element={
            <GuestRoute redirectTo="/admin">
              <AuthLayout title="Platform administration" subtitle="Manage libraries, subscriptions and platform revenue." />
            </GuestRoute>
          }
        >
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterLibraryPage />
            </GuestRoute>
          }
        />

        {/* ── Librarian dashboard ─────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['librarian']} />}>
          <Route element={<DashboardLayout role="librarian" />}>
            <Route path="/librarian" element={withSuspense(<LibrarianDashboard />)} />
            <Route path="/librarian/students" element={withSuspense(<StudentsPage />)} />
            <Route path="/librarian/students/:id" element={withSuspense(<StudentDetailPage />)} />
            <Route path="/librarian/seats" element={withSuspense(<SeatsPage />)} />
            <Route path="/librarian/fees" element={withSuspense(<FeesPage />)} />
            <Route path="/librarian/fees/history" element={withSuspense(<FeeHistoryPage />)} />
            <Route path="/librarian/employees" element={withSuspense(<EmployeesPage />)} />
            <Route path="/librarian/employees/salaries" element={withSuspense(<SalariesPage />)} />
            <Route path="/librarian/employees/attendance" element={withSuspense(<AttendancePage />)} />
            <Route path="/librarian/employees/:id" element={withSuspense(<EmployeeDetailPage />)} />
            <Route path="/librarian/finance/income" element={withSuspense(<IncomePage />)} />
            <Route path="/librarian/finance/expenses" element={withSuspense(<ExpensesPage />)} />
            <Route path="/librarian/finance/profit" element={withSuspense(<ProfitPage />)} />
            <Route path="/librarian/finance/reports" element={withSuspense(<ReportsPage />)} />
            <Route path="/librarian/notifications" element={withSuspense(<NotificationsCentre />)} />
            <Route path="/librarian/messages" element={withSuspense(<MessagesPage />)} />
            <Route path="/librarian/settings" element={withSuspense(<LibrarySettingsPage />)} />
            <Route path="/librarian/subscription" element={withSuspense(<SubscriptionPage />)} />
            <Route path="/librarian/profile" element={withSuspense(<LibrarianProfilePage />)} />
          </Route>
        </Route>

        {/* ── Admin console ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<DashboardLayout role="admin" />}>
            <Route path="/admin" element={withSuspense(<AdminDashboard />)} />
            <Route path="/admin/libraries" element={withSuspense(<AdminLibraries />)} />
            <Route path="/admin/libraries/:id" element={withSuspense(<AdminLibraryDetail />)} />
            <Route path="/admin/students" element={withSuspense(<AdminStudents />)} />
            <Route path="/admin/subscriptions" element={withSuspense(<AdminSubscriptions />)} />
            <Route path="/admin/subscriptions/controls" element={withSuspense(<AdminBillingControls />)} />
            <Route path="/admin/payments" element={withSuspense(<AdminPayments />)} />
            <Route path="/admin/messages" element={withSuspense(<AdminMessages />)} />
            <Route path="/admin/reports" element={withSuspense(<AdminReports />)} />
            <Route path="/admin/settings" element={withSuspense(<AdminSettings />)} />
            <Route path="/admin/notifications" element={withSuspense(<NotificationsCentre />)} />
          </Route>
        </Route>

        {/* ── Student portal ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route element={<DashboardLayout role="student" />}>
            <Route path="/student" element={withSuspense(<StudentDashboard />)} />
            <Route path="/student/fees" element={withSuspense(<StudentFees />)} />
            <Route path="/student/seat" element={withSuspense(<StudentSeat />)} />
            <Route path="/student/profile" element={withSuspense(<StudentProfile />)} />
            <Route path="/student/notifications" element={withSuspense(<NotificationsCentre />)} />
          </Route>
        </Route>

        {/* ── Employee portal ────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['employee']} />}>
          <Route element={<DashboardLayout role="employee" />}>
            <Route path="/employee" element={withSuspense(<EmployeeDashboard />)} />
            <Route path="/employee/salary" element={withSuspense(<EmployeeSalary />)} />
            <Route path="/employee/attendance" element={withSuspense(<EmployeeAttendance />)} />
            <Route path="/employee/notifications" element={withSuspense(<NotificationsCentre />)} />
          </Route>
        </Route>

        {/* ── Utilities ──────────────────────────────────────────── */}
        <Route path="/dashboard" element={<PortalRedirect />} />
        <Route path="*" element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
