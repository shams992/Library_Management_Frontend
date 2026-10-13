import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Armchair, ArrowRight, Bell, CalendarDays, CreditCard,
  Info, Receipt, Sparkles, UserRound, Wallet,
} from 'lucide-react';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { portalService, notificationService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate, formatMoney, formatNumber, periodToLabel } from '../../utils/format.js';

export default function StudentDashboardPage() {
  const currency = useCurrency();
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['portal', 'student', 'overview'],
    queryFn: () => portalService.studentOverview(),
  });

  const { data: summary } = useQuery({
    queryKey: ['portal', 'student', 'summary'],
    queryFn: () => portalService.studentSummary(),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', { filter: 'unread', page: 1 }],
    queryFn: () => notificationService.list({ filter: 'unread', limit: 5 }),
  });

  const overview = data?.data;
  const student = overview?.student;
  const library = overview?.library;
  const totals = summary?.data?.totals || overview?.totals || {};

  if (isLoading) return <LoadingBlock label="Loading your student dashboard…" className="min-h-[50vh]" />;
  if (isError) return <Alert tone="destructive" title="Dashboard unavailable">{error?.message}</Alert>;

  const currentFee = overview?.currentFee;

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Banner matching reference aesthetic */}
      <WelcomeBanner
        name={student?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}
        roleTitle="Student Member"
        libraryName={library?.name}
        subtitle={
          library
            ? `${library.name} · ${library.city || ''} · Open ${library.openingTime || '8:00 AM'} – ${library.closingTime || '10:00 PM'}`
            : 'Welcome to your library study space.'
        }
      />

      {/* Unregistered State: Student is registered on platform but has not applied to a library yet */}
      {(!overview?.hasMembership && !overview?.isPending && !overview?.isRejected) ? (
        <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-purple-50/90 p-6 sm:p-8 shadow-sm dark:border-indigo-900/50 dark:from-slate-900/90 dark:via-indigo-950/40 dark:to-slate-900/90">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" /> Next Step: Join a Library
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Apply for a Library Seat to Start Studying
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Your student account is active! Browse partner private libraries, check available quiet seats and study shifts, and apply. Once the librarian approves, your seat will be reserved.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 font-semibold shadow-lg shadow-indigo-500/25 shrink-0">
              <Link to="/libraries">
                Browse Libraries & Apply <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      {/* Pending Application State */}
      {overview?.isPending ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">
                    Seat Application Pending Librarian Review
                  </h3>
                  <Badge tone="warning">Pending</Badge>
                </div>
                <p className="text-xs text-amber-900/80 dark:text-amber-300">
                  You applied to <strong className="font-semibold text-amber-950 dark:text-amber-100">{library?.name || 'the library'}</strong>. The librarian has been notified on their dashboard to review and approve your seat request.
                </p>
                {student?.requestedSeat || student?.shift ? (
                  <p className="text-2xs text-amber-800 dark:text-amber-400">
                    Requested: {student?.requestedSeat ? `Seat ${student.requestedSeat}` : ''} {student?.shift ? `(${student.shift.replace('_', ' ')} shift)` : ''}
                  </p>
                ) : null}
              </div>
            </div>
            {library?.id ? (
              <Button asChild size="sm" variant="outline" className="rounded-full shrink-0 border-amber-300 bg-white dark:bg-slate-900">
                <Link to={`/libraries/${library.slug || library.id}`}>View Library</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Rejected Application State */}
      {overview?.isRejected ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-rose-950 dark:text-rose-200">
                  Application Not Approved
                </h3>
                <Badge tone="destructive">Declined</Badge>
              </div>
              <p className="text-xs text-rose-900/80 dark:text-rose-300">
                {student?.rejectionReason ? `Reason: ${student.rejectionReason}` : 'Your application was declined by the librarian. You can apply to another library.'}
              </p>
            </div>
            <Button asChild size="sm" className="rounded-full bg-rose-600 hover:bg-rose-700 text-white shrink-0">
              <Link to="/libraries">Browse Other Libraries</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {/* Overdue/Pending Fee Alert */}
      {currentFee && currentFee.status !== 'paid' ? (
        <Alert
          tone={currentFee.status === 'unpaid' ? 'warning' : 'info'}
          title={`Fee for ${periodToLabel(currentFee.periodKey)} is ${currentFee.status === 'partial' ? 'partially paid' : 'unpaid'}`}
          action={
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link to="/student/fees">See fee details</Link>
            </Button>
          }
        >
          Payable {formatMoney(currentFee.amount - (currentFee.discount || 0), currency)} · balance{' '}
          {formatMoney(Math.max(0, currentFee.amount - (currentFee.discount || 0) - currentFee.paidAmount), currency)}. Please pay
          at the counter — the librarian will record it instantly.
        </Alert>
      ) : null}

      {/* Notifications banner */}
      {notifications?.data?.length ? (
        <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 shadow-xs backdrop-blur-md dark:border-blue-900/40 dark:bg-blue-950/30">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-blue-950 dark:text-blue-200">
                {notifications.data[0]?.title}
              </p>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300">
                {notifications.data[0]?.message}
              </p>
            </div>
          </div>
          <Link
            to="/student/notifications"
            className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-xs hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-300"
          >
            View
          </Link>
        </div>
      ) : null}

      {/* 2. Quick Action Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/student/fees"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Receipt className="h-3.5 w-3.5" />
            </span>
            <span>My Fee Records</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </Link>

          <Link
            to="/student/seat"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Armchair className="h-3.5 w-3.5" />
            </span>
            <span>My Assigned Seat</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </Link>
        </div>

        <Link
          to="/student/profile"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserRound className="h-4 w-4" />
          <span>My Profile</span>
        </Link>
      </div>

      {/* 3. 4 Glass Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My Seat"
          value={student?.seatNumber ? `Seat ${student.seatNumber}` : 'Not assigned'}
          hint={student?.seatNumber ? 'Quiet & dedicated desk' : 'Ask librarian for seat'}
          icon={Armchair}
          tone={student?.seatNumber ? 'teal' : 'warning'}
          sparkline="bars"
          trend={{ direction: 'up', value: 'Active' }}
        />

        <StatCard
          label="Monthly Fee"
          value={formatMoney(student?.monthlyFee || 0, currency)}
          hint={student?.shift ? `Shift: ${student.shift.replace('_', ' ')}` : 'Standard membership'}
          icon={Wallet}
          tone="primary"
          sparkline="wave"
          trend={{ direction: 'flat', value: '0%' }}
        />

        <StatCard
          label="Total Paid"
          value={formatMoney(totals.totalPaid || 0, currency, { compact: true })}
          hint={`${formatNumber(totals.paymentCount || 0)} payment record(s)`}
          icon={CreditCard}
          tone="success"
          sparkline="wave"
          trend={{ direction: 'up', value: '100%' }}
        />

        <StatCard
          label="Outstanding Dues"
          value={formatMoney(totals.totalDue || 0, currency, { compact: true })}
          hint={totals.totalDue > 0 ? 'Please clear at counter' : 'All clear — thank you!'}
          icon={Receipt}
          tone={totals.totalDue > 0 ? 'destructive' : 'success'}
          sparkline="ring"
          trend={{ direction: totals.totalDue > 0 ? 'down' : 'flat', value: totals.totalDue > 0 ? 'Due' : 'Clear' }}
        />
      </div>

      {/* 4. Main Section: Fee Status & Library Study Desk Info */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: Fee Status Table */}
        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">My Fee Records</h3>
              <p className="text-xs text-slate-400">Month-by-month verified status</p>
            </div>
            <Link to="/student/fees" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Full history &rsaquo;
            </Link>
          </div>

          <div className="mt-4">
            {overview?.recentFees?.length ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {overview.recentFees.map((fee) => (
                  <li key={fee.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{periodToLabel(fee.periodKey)}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Paid {formatMoney(fee.paidAmount, currency)} of {formatMoney(fee.amount - (fee.discount || 0), currency)}
                      </p>
                    </div>
                    <StatusBadge status={fee.status} kind="fee" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact illustration="fees" title="No fee records yet" description="Invoices generated by your library will appear here." />
            )}
          </div>
        </div>

        {/* Right: Library Desk Info + Motivation Artwork */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 space-y-3.5 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Library Information
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Library</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{library?.name || 'LibraDesk Library'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">City</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{library?.city || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Timings</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {library ? `${library.openingTime} – ${library.closingTime}` : '8:00 AM – 10:00 PM'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Student Code</span>
              <Badge tone="info" className="rounded-lg">{student?.studentCode || 'STU-001'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Member Since</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(student?.registrationDate)}</span>
            </div>
          </div>

          {/* Keep Going motivation card */}
          <div className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 flex items-center justify-between">
            <div>
              <span className="block font-serif italic text-base font-bold text-indigo-600 dark:text-indigo-400">
                Keep Learning 💙
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Every study session counts toward your goals.
              </span>
            </div>
            <div className="h-14 w-14 shrink-0 rounded-2xl overflow-hidden shadow-xs border border-white/80 dark:border-white/10">
              <img src="/keep-going-books.jpg" alt="Books" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
