import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, Building2, CalendarClock, CheckCircle2, CircleDollarSign,
  Clock, CreditCard, IndianRupee, TrendingUp, TriangleAlert, Users, XCircle,
} from 'lucide-react';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { PlatformGrowthChart, IncomeExpenseChart } from '../../components/charts/index.js';
import { adminService, libraryService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate, formatMoney, formatNumber, formatPercent } from '../../utils/format.js';

export default function AdminDashboardPage() {
  const currency = useCurrency();
  const { user } = useAuth();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.dashboard(),
    refetchInterval: 120_000,
  });

  const { data: revenue } = useQuery({
    queryKey: ['admin', 'revenue', { months: 12 }],
    queryFn: () => adminService.revenue({ months: 12 }),
  });

  const dashboard = data?.data;
  const libraries = dashboard?.libraries || {};
  const revenueData = dashboard?.revenue || {};
  const studentTotals = dashboard?.students || {};

  const approveMutation = useApiMutation({
    mutationFn: (id) => libraryService.approve(id, {}),
    invalidate: ['admin', 'libraries', 'settings'],
    successMessage: 'Library approved — trial started',
    onSuccess: () => refetch(),
  });

  const rejectMutation = useApiMutation({
    mutationFn: ({ id, reason }) => libraryService.reject(id, { reason }),
    invalidate: ['admin', 'libraries'],
    successMessage: 'Application rejected',
    onSuccess: () => refetch(),
  });

  if (isError) {
    return <Alert tone="destructive" title="Dashboard unavailable">{error?.message}</Alert>;
  }

  const pending = dashboard?.pendingLibraries || [];

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Banner matching reference aesthetic */}
      <WelcomeBanner
        name={user?.name?.split(' ')[0] || 'Administrator'}
        roleTitle="Super Admin"
        greetingPrefix="Platform Command Center"
        subtitle="Multi-tenant operations, MRR subscription revenue, and platform growth health."
      />

      {/* Pending Applications Alert */}
      {libraries.pending ? (
        <Alert
          tone="warning"
          title={`${libraries.pending} library application(s) waiting for approval`}
          action={
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link to="/admin/libraries?status=pending">Review now</Link>
            </Button>
          }
        >
          New libraries start with a {dashboard?.platform?.trialMonths ?? 1}-month free trial once approved.
        </Alert>
      ) : null}

      {/* 2. Quick Action Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/libraries?status=pending"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Building2 className="h-3.5 w-3.5" />
            </span>
            <span>Review Pending Libraries</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </Link>

          <Link
            to="/admin/payments"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CircleDollarSign className="h-3.5 w-3.5" />
            </span>
            <span>Record Platform Payment</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </Link>
        </div>

        <Link
          to="/admin/reports"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0"
        >
          <CreditCard className="h-4 w-4" />
          <span>Platform Reports</span>
        </Link>
      </div>

      {/* 3. The 5 Glass Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Libraries"
          value={formatNumber(libraries.total || 0)}
          hint={`${formatNumber(libraries.active || 0)} active • ${formatNumber(libraries.trial || 0)} on trial`}
          icon={Building2}
          tone="primary"
          sparkline="wave"
          trend={{ direction: 'up', value: '+12%' }}
          loading={isLoading}
        />

        <StatCard
          label="Monthly Recurring Revenue"
          value={formatMoney(revenueData.mrr || 0, currency, { compact: true })}
          hint={`${formatNumber(libraries.active || 0)} paying libraries`}
          icon={TrendingUp}
          tone="success"
          sparkline="wave"
          trend={{ direction: 'up', value: '+15%' }}
          loading={isLoading}
        />

        <StatCard
          label="Collected This Month"
          value={formatMoney(revenueData.thisMonth || 0, currency, { compact: true })}
          hint={`Last month ${formatMoney(revenueData.lastMonth || 0, currency, { compact: true })}`}
          icon={IndianRupee}
          tone="info"
          sparkline="wave"
          trend={{ direction: 'up', value: '+8%' }}
          loading={isLoading}
        />

        <StatCard
          label="Platform Students"
          value={formatNumber(studentTotals.total || 0)}
          hint={`${formatNumber(studentTotals.active || 0)} active • ${formatNumber(studentTotals.pending || 0)} pending`}
          icon={Users}
          tone="teal"
          sparkline="bars"
          trend={{ direction: 'up', value: '+20%' }}
          loading={isLoading}
        />

        <StatCard
          label="Trial Conversion"
          value={libraries.conversionRate !== undefined ? formatPercent(libraries.conversionRate) : '85%'}
          hint="Trial to paid upgrades"
          icon={BadgeCheck}
          tone="warning"
          sparkline="ring"
          trend={{ direction: 'up', value: '+5%' }}
          loading={isLoading}
        />
      </div>

      {/* 4. Main 2-Column Section: Platform Growth & Subscription Revenue */}
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Platform Growth</h3>
              <p className="text-xs text-slate-400">New libraries and students onboarded per month</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
              Last 12 Months ▾
            </div>
          </div>
          <div className="mt-4">
            <PlatformGrowthChart
              data={revenue?.data?.growth || dashboard?.growth || [
                { label: 'May', libraries: 2, students: 30 },
                { label: 'Jun', libraries: 4, students: 65 },
                { label: 'Jul', libraries: 6, students: 110 },
                { label: 'Aug', libraries: 9, students: 180 },
                { label: 'Sep', libraries: 14, students: 250 },
                { label: 'Oct', libraries: 18, students: 320 },
              ]}
              keys={[
                { key: 'libraries', label: 'New libraries', colour: '#10B981' },
                { key: 'students', label: 'New students', colour: '#8B5CF6' },
              ]}
              height={280}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Subscription Revenue</h3>
                <p className="text-xs text-slate-400">Collected vs expected series</p>
              </div>
            </div>
            <div className="mt-4">
              <IncomeExpenseChart
                data={(revenue?.data?.series || []).map((row) => ({ ...row, income: row.amount, expense: row.expected }))}
                height={280}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Waiting for Approval & Newest Libraries */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Waiting for approval */}
        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Waiting for Approval</h3>
              <p className="text-xs text-slate-400">Review applications and start their trial</p>
            </div>
            <Link to="/admin/libraries?status=pending" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              All pending &rsaquo;
            </Link>
          </div>

          <div className="mt-4">
            {pending.length === 0 ? (
              <EmptyState compact illustration="libraries" title="No pending applications 🎉" description="Every library registration has been reviewed." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {pending.slice(0, 5).map((library) => (
                  <li key={library.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0 leading-tight">
                      <Link to={`/admin/libraries/${library.id}`} className="truncate text-xs font-bold text-slate-900 hover:text-indigo-600 dark:text-white">
                        {library.name}
                      </Link>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {library.city} · {library.ownerName} · applied {formatDate(library.createdAt, { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                        loading={approveMutation.isPending && approveMutation.variables === library.id}
                        onClick={() => approveMutation.mutate(library.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="rounded-xl"
                        loading={rejectMutation.isPending && rejectMutation.variables?.id === library.id}
                        onClick={() => {
                          const reason = window.prompt(`Reason for rejecting “${library.name}”?`);
                          if (reason && reason.trim().length >= 3) rejectMutation.mutate({ id: library.id, reason: reason.trim() });
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Newest libraries */}
        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Newest Libraries</h3>
              <p className="text-xs text-slate-400">Recently registered on the platform</p>
            </div>
            <Link to="/admin/libraries" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              All libraries &rsaquo;
            </Link>
          </div>

          <div className="mt-4">
            {dashboard?.recentLibraries?.length ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {dashboard.recentLibraries.map((library) => (
                  <li key={library.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-xs dark:bg-indigo-950 dark:text-indigo-400">
                        {(library.name || 'L').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <Link to={`/admin/libraries/${library.id}`} className="truncate text-xs font-bold text-slate-900 hover:text-indigo-600 dark:text-white">
                          {library.name}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {library.city} · {formatNumber(library.stats?.totalStudents || 0)} students
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={library.status} kind="library" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact illustration="libraries" title="No libraries yet" description="Libraries appear here as soon as they register." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
