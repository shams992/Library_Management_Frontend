import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Banknote, BriefcaseBusiness, CalendarCheck, Clock, Umbrella, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Separator } from '../../components/ui/misc.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { portalService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { useAuth } from '../../hooks/useAuth.js';
import { currentPeriod, formatDate, formatMoney, formatNumber, periodToLabel } from '../../utils/format.js';

/** Employee home: attendance this month, salary status and library info. */
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

  if (isLoading) return <LoadingBlock label="Loading your dashboard…" className="min-h-[50vh]" />;
  if (isError) return <Alert tone="destructive" title="Dashboard unavailable">{error?.message}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${employee?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Team member'}`}
        description={
          library
            ? `${library.name} · ${employee?.position || ''}${employee?.department ? ` · ${employee.department}` : ''}`
            : 'Your employee dashboard'
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/employee/salary"><Banknote className="h-4 w-4" /> My salary</Link>
          </Button>
        }
      />

      {salary && salary.status !== 'paid' ? (
        <Alert
          tone={salary.status === 'partial' ? 'warning' : 'info'}
          title={`Salary for ${periodToLabel(salary.periodKey)} is ${salary.status}`}
          action={<Button asChild size="sm" variant="outline"><Link to="/employee/salary">See details</Link></Button>}
        >
          Net payable {formatMoney(salary.netAmount, currency)} · paid so far {formatMoney(salary.paidAmount, currency)}.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Present this month"
          value={formatNumber(attendance.present)}
          hint={`${formatNumber(attendance.total)} day(s) marked`}
          icon={CalendarCheck}
          tone="success"
        />
        <StatCard label="Absent" value={formatNumber(attendance.absent)} hint={`${formatNumber(attendance.leave)} leave day(s)`} icon={Umbrella} tone={attendance.absent ? 'warning' : 'default'} />
        <StatCard
          label="Monthly salary"
          value={formatMoney(employee?.salary, currency)}
          hint={employee?.salaryType ? `${employee.salaryType} rate` : ''}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Total earned"
          value={formatMoney(totals.totalPaid, currency, { compact: true })}
          hint={`${formatNumber(totals.salaryCount)} salary record(s)`}
          icon={Banknote}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Recent attendance</CardTitle>
              <CardDescription>Marked daily by your librarian</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/employee/attendance">Full history</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overview?.recentAttendance?.length ? (
              <ul className="divide-y divide-border">
                {overview.recentAttendance.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-sm">{formatDate(row.date, { weekday: 'short', day: '2-digit', month: 'short' })}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.checkIn ? `${row.checkIn}${row.checkOut ? ` – ${row.checkOut}` : ''}` : 'No times recorded'}
                      </p>
                    </div>
                    <StatusBadge status={row.status} kind="attendance" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact illustration="employees" title="No attendance marked yet" description="Your librarian marks attendance each day — it will show up here." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-primary" /> My position</CardTitle>
              <CardDescription>What your library recorded</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Position</span>
                <span className="font-medium">{employee?.position || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{employee?.department || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Employee ID</span>
                <Badge tone="info">{employee?.employeeCode || '—'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">{formatDate(employee?.joiningDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={employee?.status || 'active'} kind="employee" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Library</span>
                <span className="font-medium">{library?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Timings</span>
                <span className="font-medium">{library ? `${library.openingTime} – ${library.closingTime}` : '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Salary for {periodToLabel(currentPeriod())} is calculated by your library. If something looks wrong, speak to the
                librarian — they can adjust bonus or deduction before payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
