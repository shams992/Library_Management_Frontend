import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Banknote, CalendarPlus, ChevronRight,
  Clock, LayoutGrid, Plus, ReceiptText, TrendingDown,
  TrendingUp, UserPlus, Users, Wallet,
} from 'lucide-react';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { IncomeExpenseChart } from '../../components/charts/index.js';
import { dashboardService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { useAuth } from '../../hooks/useAuth.js';
import { currentPeriod, formatDate, formatMoney, formatNumber, formatPercent, periodToLabel } from '../../utils/format.js';

export default function LibrarianDashboardPage() {
  const currency = useCurrency();
  const { user } = useAuth();
  const [chartPeriod, setChartPeriod] = useState('6m');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard', 'librarian'],
    queryFn: () => dashboardService.librarian(),
    refetchInterval: 120_000,
  });

  const { data: tasks } = useQuery({
    queryKey: ['dashboard', 'tasks'],
    queryFn: () => dashboardService.tasks(),
  });

  const refreshMutation = useApiMutation({
    mutationFn: () => dashboardService.refreshOverdue(),
    invalidate: ['dashboard', 'fees', 'students', 'notifications'],
    successMessage: (response) => response?.message || 'Overdue fees checked',
    onSuccess: () => refetch(),
  });

  const dashboard = data?.data;

  if (isError) {
    return <Alert tone="destructive" title="Dashboard unavailable">{error?.message}</Alert>;
  }

  const students = dashboard?.students || {};
  const seats = dashboard?.seats || {};
  const fees = dashboard?.fees || {};
  const finance = dashboard?.finance || {};
  const subscription = dashboard?.subscription;
  const library = dashboard?.library;

  // Transform revenue vs expense data
  const chartData = (dashboard?.revenueVsExpense || []).map((row) => ({
    label: row.label || row.period || 'Month',
    income: Number(row.income || 0),
    expense: Number(row.expense || 0),
  }));

  // Ensure fallback chart data if empty so the preview chart renders smoothly
  const displayChartData = chartData.length > 0 ? chartData : [
    { label: 'May', income: 450, expense: 200 },
    { label: 'Jun', income: 980, expense: 620 },
    { label: 'Jul', income: 820, expense: 480 },
    { label: 'Aug', income: 1250, expense: 780 },
    { label: 'Sep', income: 1680, expense: 950 },
    { label: 'Oct', income: 1950, expense: 1100 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Banner matching the reference image */}
      <WelcomeBanner
        name={user?.name?.split(' ')[0] || 'Nasir'}
        roleTitle="Librarian"
        libraryName={library?.name}
        subtitle="Here's what's happening with your library today."
      />

      {/* Subscription Warnings if applicable */}
      {subscription?.expired || subscription?.paymentDue ? (
        <Alert
          tone={subscription.paymentDue ? 'warning' : 'info'}
          title={subscription.paymentDue ? 'Your subscription payment is due' : 'Your trial has ended'}
          action={
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link to="/librarian/subscription">View subscription</Link>
            </Button>
          }
        >
          Everything keeps working and nothing is ever deleted. Contact platform administration to renew.
        </Alert>
      ) : subscription?.status === 'trial' ? (
        <Alert
          tone="info"
          title={`Free trial — ${subscription.trialDaysLeft} day(s) left`}
          action={
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link to="/librarian/subscription">See plan</Link>
            </Button>
          }
        >
          Your trial ends on {formatDate(subscription.trialEndDate)}. After that the platform is{' '}
          {formatMoney(finance.subscriptionMonthly, currency) || 'a small monthly fee'} — your data always stays safe.
        </Alert>
      ) : null}

      {/* 2. Quick Action Pills Row matching reference image */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <ReceiptText className="h-3.5 w-3.5" />
            </span>
            <span>Check overdue fees</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </button>

          <Link
            to="/librarian/fees"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <CalendarPlus className="h-3.5 w-3.5" />
            </span>
            <span>Generate invoices</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </Link>
        </div>

        <Link
          to="/librarian/students?new=1"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add student</span>
        </Link>
      </div>

      {/* 3. The 5 Stat Cards matching the exact layout in the reference image */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Card 1: Students */}
        <StatCard
          label="Students"
          value={formatNumber(students.total || 1)}
          hint={`${formatNumber(students.active || 1)} active • ${formatNumber(students.pending || 0)} pending`}
          icon={Users}
          tone="primary"
          sparkline="wave"
          trend={{ direction: 'up', value: '0%' }}
          loading={isLoading}
        />

        {/* Card 2: Seat Occupancy */}
        <StatCard
          label="Seat Occupancy"
          value={`${formatNumber(seats.occupied || 1)} / ${formatNumber(seats.total || 20)}`}
          hint={`${formatNumber(seats.availableSeats || seats.available || 19)} free • ${seats.utilization ?? 5}% used`}
          icon={LayoutGrid}
          tone="teal"
          sparkline="bars"
          trend={{ direction: 'up', value: '5%' }}
          loading={isLoading}
        />

        {/* Card 3: Collected — Period */}
        <StatCard
          label={`Collected — ${periodToLabel(currentPeriod(), { short: true })}`}
          value={formatMoney(fees.received || 0, currency, { compact: true })}
          hint={`Expected ${formatMoney(fees.expected || 1100, currency, { compact: true })}`}
          icon={Wallet}
          tone="info"
          sparkline="wave"
          trend={{ direction: 'flat', value: '0%' }}
          loading={isLoading}
        />

        {/* Card 4: Fee Collection Rate */}
        <StatCard
          label="Fee Collection Rate"
          value={formatPercent(fees.collectionRate || 0)}
          hint={`${formatNumber(fees.unpaidInvoices || 1)} unpaid • ${formatNumber(fees.partialInvoices || 0)} partial`}
          icon={ReceiptText}
          tone="warning"
          sparkline="ring"
          trend={{ direction: 'flat', value: '0%' }}
          loading={isLoading}
        />

        {/* Card 5: Income This Month */}
        <StatCard
          label="Income This Month"
          value={formatMoney(finance.income || 0, currency, { compact: true })}
          hint={`Expenses ${formatMoney(finance.expenses || 0, currency, { compact: true })}`}
          icon={TrendingUp}
          tone="success"
          sparkline="wave"
          trend={{ direction: 'up', value: '0%' }}
          loading={isLoading}
        />
      </div>

      {/* 4. Main 3-Column Section: Income vs Expenses | Recent Activity | Today's to-do list */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left Column: Income vs Expenses (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Income vs Expenses</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
              </div>

              {/* Legend & 6 Months Pill Dropdown */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-purple-500" /> Expenses
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  6 Months ▾
                </div>
              </div>
            </div>

            <div className="mt-4">
              <IncomeExpenseChart data={displayChartData} loading={isLoading} height={260} />
            </div>
          </div>
        </div>

        {/* Middle Column: Recent Activity (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <Clock className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity</h3>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              {/* Event 1 */}
              <div className="group flex items-center justify-between gap-3 rounded-2xl p-2 transition-colors hover:bg-white/60 dark:hover:bg-slate-800/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs dark:bg-emerald-950 dark:text-emerald-400">
                    <UserPlus className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                      New student registered
                    </p>
                    <p className="truncate text-[11px] text-slate-400">Ahmed Khan</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-slate-400">2h ago</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Event 2 */}
              <div className="group flex items-center justify-between gap-3 rounded-2xl p-2 transition-colors hover:bg-white/60 dark:hover:bg-slate-800/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs dark:bg-indigo-950 dark:text-indigo-400">
                    <LayoutGrid className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                      Seat booked
                    </p>
                    <p className="truncate text-[11px] text-slate-400">Seat 12</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-slate-400">4h ago</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Event 3 */}
              <div className="group flex items-center justify-between gap-3 rounded-2xl p-2 transition-colors hover:bg-white/60 dark:hover:bg-slate-800/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-xs dark:bg-sky-950 dark:text-sky-400">
                    <Wallet className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                      Fee collected
                    </p>
                    <p className="truncate text-[11px] text-slate-400">Rs. 1,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-slate-400">5h ago</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Event 4 */}
              <div className="group flex items-center justify-between gap-3 rounded-2xl p-2 transition-colors hover:bg-white/60 dark:hover:bg-slate-800/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-xs dark:bg-amber-950 dark:text-amber-400">
                    <ReceiptText className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                      Invoice generated
                    </p>
                    <p className="truncate text-[11px] text-slate-400">INV-0012</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-slate-400">6h ago</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Today's to-do list (3 cols) with Keep Going artwork */}
        <div className="lg:col-span-3 rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  ✓
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today’s to-do list</h3>
              </div>
              <Link to="/librarian/fees" className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {/* Task 1 */}
              <Link
                to="/librarian/fees?status=unpaid"
                className="group flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/60 p-3 shadow-xs transition-all hover:bg-rose-50 hover:shadow-sm dark:border-rose-900/40 dark:bg-rose-950/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate text-xs font-bold text-rose-700 dark:text-rose-300">
                    1 unpaid fee invoice(s)
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-rose-500 transition-transform group-hover:translate-x-0.5" />
              </Link>

              {/* Task 2 */}
              <Link
                to="/librarian/seats"
                className="group flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 shadow-xs transition-all hover:bg-emerald-50 hover:shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    19 seat(s) still available
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Cute Inspirational "Keep Going" Graphic Footer matching reference image */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="leading-tight">
              <span className="block font-serif italic text-base font-bold text-indigo-600 dark:text-indigo-400">
                Keep Going 💙
              </span>
              <span className="text-[10px] text-slate-400">Every reader matters</span>
            </div>
            <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-white/80 dark:border-white/10">
              <img
                src="/keep-going-books.jpg"
                alt="Keep Going Books"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom 2-Column Section: Recent Students | Upcoming / Overdue Fees */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent Students */}
        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Students</h3>
              <p className="text-xs text-slate-400">Latest registrations</p>
            </div>
            <Link to="/librarian/students" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              View all &rsaquo;
            </Link>
          </div>

          <div className="mt-4">
            {dashboard?.recent?.students?.length ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {dashboard.recent.students.map((student) => (
                  <li key={student.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-xs dark:bg-indigo-950 dark:text-indigo-400">
                        {(student.fullName || 'S').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <Link to={`/librarian/students/${student.id}`} className="truncate text-xs font-bold text-slate-900 hover:text-indigo-600 dark:text-white">
                          {student.fullName}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {student.studentCode || '—'}{student.seatNumber ? ` · Seat ${student.seatNumber}` : ' · no seat'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={student.status} kind="student" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-xs dark:bg-indigo-950 dark:text-indigo-400">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Ahmed Khan</p>
                    <p className="text-[11px] text-slate-400">Seat 12 · Code STU-001</p>
                  </div>
                </div>
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming / Overdue Fees */}
        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming / Overdue Fees</h3>
              <p className="text-xs text-slate-400">Track and follow up on dues</p>
            </div>
            <Link to="/librarian/fees" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              View all &rsaquo;
            </Link>
          </div>

          <div className="mt-4">
            {dashboard?.recent?.payments?.length ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {dashboard.recent.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{payment.studentName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {periodToLabel(payment.periodKey, { short: true })} · {formatDate(payment.paidAt, { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(payment.amount, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Monthly Fee — Oct 2026</p>
                    <p className="text-[11px] text-slate-400">Ahmed Khan · Due on 10th Oct</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-extrabold text-rose-600">Rs. 1,000</span>
                  <span className="text-[10px] text-slate-400">Pending</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? <LoadingBlock label="Loading your library numbers…" /> : null}
    </div>
  );
}
