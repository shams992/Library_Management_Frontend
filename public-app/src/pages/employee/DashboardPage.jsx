import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Banknote, BriefcaseBusiness, CalendarCheck, Clock,
  Umbrella, UserCheck, Wallet,
} from 'lucide-react';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { portalService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { useAuth } from '../../hooks/useAuth.js';
import { currentPeriod, formatDate, formatMoney, formatNumber, periodToLabel } from '../../utils/format.js';

export default function EmployeeDashboardPage() {
  const currency = useCurrency();
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['portal', 'employee', 'overview'],
    queryFn: () => portalService.employeeOverview(),
  });

  const overview = data?.data;
  const employee = overview?.employee;
  const library = overview?.library;
  const attendance = overview?.attendance || {};
  const salary = overview?.currentSalary;
  const totals = overview?.totals || {};

  if (isLoading) return <LoadingBlock label="Loading employee dashboard…" className="min-h-[50vh]" />;
  if (isError) return <Alert tone="destructive" title="Dashboard unavailable">{error?.message}</Alert>;

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Banner matching reference aesthetic */}
      <WelcomeBanner
        name={employee?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Team member'}
        roleTitle="Staff Workspace"
        libraryName={library?.name}
        subtitle={
          library
            ? `${library.name} · ${employee?.position || 'Staff'} · ${employee?.department || 'Operations'}`
            : 'Your staff workspace, daily attendance, and salary cockpit.'
        }
      />

      {/* Salary Pending Alert if applicable */}
      {salary && salary.status !== 'paid' ? (
        <Alert
          tone={salary.status === 'partial' ? 'warning' : 'info'}
          title={`Salary for ${periodToLabel(salary.periodKey)} is ${salary.status}`}
          action={
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link to="/employee/salary">See details</Link>
            </Button>
          }
        >
          Net payable {formatMoney(salary.netAmount, currency)} · paid so far {formatMoney(salary.paidAmount, currency)}.
        </Alert>
      ) : null}

      {/* 2. Quick Action Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/employee/salary"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Banknote className="h-3.5 w-3.5" />
            </span>
            <span>View Salary Slip</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </Link>

          <Link
            to="/employee/attendance"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <CalendarCheck className="h-3.5 w-3.5" />
            </span>
            <span>Attendance Log</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </Link>
        </div>

        <Link
          to="/employee/attendance"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserCheck className="h-4 w-4" />
          <span>Mark Shift Check-in</span>
        </Link>
      </div>

      {/* 3. 4 Glass Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Present this month"
          value={formatNumber(attendance.present || 0)}
          hint={`${formatNumber(attendance.total || 0)} day(s) marked`}
          icon={CalendarCheck}
          tone="teal"
          sparkline="bars"
          trend={{ direction: 'up', value: 'Active' }}
        />

        <StatCard
          label="Absent / Leaves"
          value={formatNumber(attendance.absent || 0)}
          hint={`${formatNumber(attendance.leave || 0)} approved leave day(s)`}
          icon={Umbrella}
          tone={attendance.absent ? 'warning' : 'default'}
          sparkline="ring"
          trend={{ direction: 'flat', value: '0%' }}
        />

        <StatCard
          label="Monthly Salary"
          value={formatMoney(employee?.salary || 0, currency)}
          hint={employee?.salaryType ? `${employee.salaryType} payroll` : 'Standard payroll'}
          icon={Wallet}
          tone="primary"
          sparkline="wave"
          trend={{ direction: 'flat', value: '0%' }}
        />

        <StatCard
          label="Total Earned"
          value={formatMoney(totals.totalPaid || 0, currency, { compact: true })}
          hint={`${formatNumber(totals.salaryCount || 0)} salary record(s)`}
          icon={Banknote}
          tone="success"
          sparkline="wave"
          trend={{ direction: 'up', value: '100%' }}
        />
      </div>

      {/* 4. Main Section: Attendance & Position Info */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: Recent Attendance */}
        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Attendance</h3>
              <p className="text-xs text-slate-400">Marked daily by library management</p>
            </div>
            <Link to="/employee/attendance" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Full history &rsaquo;
            </Link>
          </div>

          <div className="mt-4">
            {overview?.recentAttendance?.length ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {overview.recentAttendance.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatDate(row.date, { weekday: 'short', day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {row.checkIn ? `${row.checkIn}${row.checkOut ? ` – ${row.checkOut}` : ''}` : 'Standard shift'}
                      </p>
                    </div>
                    <StatusBadge status={row.status} kind="attendance" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact illustration="employees" title="No attendance marked yet" description="Attendance recorded for your shifts will show up here." />
            )}
          </div>
        </div>

        {/* Right: Staff Position Card & Keep Going */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 space-y-3.5 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-indigo-500" /> My Position
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Position</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{employee?.position || 'Staff Member'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Department</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{employee?.department || 'Operations'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Employee ID</span>
              <Badge tone="info" className="rounded-lg">{employee?.employeeCode || 'EMP-001'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Joined</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(employee?.joiningDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <StatusBadge status={employee?.status || 'active'} kind="employee" />
            </div>
          </div>

          {/* Motivation card */}
          <div className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 flex items-center justify-between">
            <div>
              <span className="block font-serif italic text-base font-bold text-indigo-600 dark:text-indigo-400">
                Staff Excellence 💙
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Thank you for keeping the library running smoothly.
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
