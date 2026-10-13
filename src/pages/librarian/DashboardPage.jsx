import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Banknote, BriefcaseBusiness, CalendarPlus, LayoutGrid, ReceiptText, TrendingDown,
  TrendingUp, UserCheck, Users, Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Skeleton } from '../../components/ui/misc.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { IncomeExpenseChart, FeeCollectionChart } from '../../components/charts/index.js';
import { dashboardService, feeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { useAuth } from '../../hooks/useAuth.js';
import { currentPeriod, formatDate, formatMoney, formatNumber, formatPercent, periodToLabel } from '../../utils/format.js';

/** The librarian's daily cockpit — every figure comes from GET /api/dashboard/librarian. */
export default function LibrarianDashboardPage() {
  const currency = useCurrency();
  const { user } = useAuth();

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Assalam-o-Alaikum, ${user?.name?.split(' ')[0] || 'Librarian'}`}
        description={
          library
            ? `${library.name}${library.city ? ` · ${library.city}` : ''} · ${dashboard?.period?.label || ''}`
            : 'Your library at a glance'
        }
        actions={
          <>
            <Button variant="outline" onClick={() => refreshMutation.mutate()} loading={refreshMutation.isPending}>
              <ReceiptText className="h-4 w-4" /> Check overdue fees
            </Button>
            <Button asChild variant="outline">
              <Link to="/librarian/fees"><CalendarPlus className="h-4 w-4" /> Generate invoices</Link>
            </Button>
            <Button asChild>
              <Link to="/librarian/students?new=1"><Users className="h-4 w-4" /> Add student</Link>
            </Button>
          </>
        }
      />

      {subscription?.expired || subscription?.paymentDue ? (
        <Alert
          tone={subscription.paymentDue ? 'warning' : 'info'}
          title={subscription.paymentDue ? 'Your subscription payment is due' : 'Your trial has ended'}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/librarian/subscription">View subscription</Link>
            </Button>
          }
        >
          Everything keeps working and nothing is ever deleted. Contact platform administration to renew — they will extend your
          access immediately.
        </Alert>
      ) : subscription?.status === 'trial' ? (
        <Alert
          tone="info"
          title={`Free trial — ${subscription.trialDaysLeft} day(s) left`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/librarian/subscription">See plan</Link>
            </Button>
          }
        >
          Your trial ends on {formatDate(subscription.trialEndDate)}. After that the platform is{' '}
          {formatMoney(finance.subscriptionMonthly, currency) || 'a small monthly fee'} — your data always stays safe.
        </Alert>
      ) : null}

      {tasks?.data?.tasks?.length ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today’s to-do list</CardTitle>
            <CardDescription>Pulled live from your library’s data</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {tasks.data.tasks.map((task) => (
              <Button key={task.id} asChild variant="outline" size="sm">
                <Link to={task.link}>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      task.severity === 'warning' ? 'bg-warning' : task.severity === 'info' ? 'bg-info' : 'bg-success'
                    }`}
                  />
                  {task.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Students"
          value={formatNumber(students.total)}
          hint={`${formatNumber(students.active)} active · ${formatNumber(students.pending)} pending`}
          icon={Users}
          tone="primary"
          loading={isLoading}
        />
        <StatCard
          label="Seat occupancy"
          value={`${formatNumber(seats.occupied)} / ${formatNumber(seats.total)}`}
          hint={`${formatNumber(seats.availableSeats)} free · ${seats.utilization ?? 0}% used`}
          icon={LayoutGrid}
          tone="info"
          loading={isLoading}
        />
        <StatCard
          label={`Collected — ${periodToLabel(currentPeriod(), { short: true })}`}
          value={formatMoney(fees.received, currency, { compact: true })}
          hint={`Expected ${formatMoney(fees.expected, currency, { compact: true })}`}
          icon={Wallet}
          tone="success"
          loading={isLoading}
        />
        <StatCard
          label="Fee collection rate"
          value={formatPercent(fees.collectionRate)}
          hint={`${formatNumber(fees.unpaidInvoices || 0)} unpaid · ${formatNumber(fees.partialInvoices || 0)} partial`}
          icon={ReceiptText}
          tone={fees.collectionRate >= 80 ? 'success' : 'warning'}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Income this month" value={formatMoney(finance.income, currency, { compact: true })} icon={TrendingUp} tone="success" loading={isLoading} />
        <StatCard label="Expenses this month" value={formatMoney(finance.expenses, currency, { compact: true })} hint={`Salaries ${formatMoney(finance.salariesPaid, currency, { compact: true })}`} icon={TrendingDown} tone="destructive" loading={isLoading} />
        <StatCard
          label="Net profit"
          value={formatMoney(finance.profit, currency, { compact: true })}
          hint={`Margin ${formatPercent(finance.margin)}`}
          icon={Banknote}
          tone={finance.profit >= 0 ? 'success' : 'destructive'}
          valueClassName={finance.profit >= 0 ? undefined : 'text-destructive'}
          loading={isLoading}
        />
        <StatCard
          label="Employees"
          value={formatNumber(dashboard?.employees?.total)}
          hint={`${formatNumber(dashboard?.employees?.pendingSalaries)} salary payment(s) pending`}
          icon={BriefcaseBusiness}
          tone="primary"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs expenses</CardTitle>
            <CardDescription>Last 6 months, from your recorded transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={dashboard?.revenueVsExpense || []} loading={isLoading} height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Fee collection</CardTitle>
              <CardDescription>Collected vs pending, month by month</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/librarian/fees">Open fees</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <FeeCollectionChart
              data={(dashboard?.revenueVsExpense || []).map((row) => ({ ...row, received: row.income, pending: Math.max(0, row.expected - row.income) }))}
              loading={isLoading}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">New students</CardTitle>
              <CardDescription>Latest registrations</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/librarian/students">All</Link></Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : dashboard?.recent?.students?.length ? (
              <ul className="divide-y divide-border">
                {dashboard.recent.students.map((student) => (
                  <li key={student.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link to={`/librarian/students/${student.id}`} className="truncate text-sm font-medium hover:text-primary">
                        {student.fullName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {student.studentCode || '—'}{student.seatNumber ? ` · Seat ${student.seatNumber}` : ' · no seat'}
                      </p>
                    </div>
                    <StatusBadge status={student.status} kind="student" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                illustration="students"
                title="No students yet"
                description="Add your first student to start tracking seats and fees."
                action={<Button asChild size="sm"><Link to="/librarian/students?new=1">Add student</Link></Button>}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent payments</CardTitle>
              <CardDescription>Fees collected</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/librarian/fees/history">History</Link></Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : dashboard?.recent?.payments?.length ? (
              <ul className="divide-y divide-border">
                {dashboard.recent.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{payment.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {periodToLabel(payment.periodKey, { short: true })} · {formatDate(payment.paidAt, { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-success">{formatMoney(payment.amount, currency)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact illustration="fees" title="No payments recorded yet" description="Recorded payments show up here instantly." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent expenses</CardTitle>
              <CardDescription>Money going out</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/librarian/finance/expenses">Ledger</Link></Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : dashboard?.recent?.expenses?.length ? (
              <ul className="divide-y divide-border">
                {dashboard.recent.expenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{expense.title}</p>
                      <p className="text-xs capitalize text-muted-foreground">{expense.category} · {formatDate(expense.date, { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <span className="text-sm font-medium text-destructive">{formatMoney(expense.amount, currency)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                illustration="finance"
                title="No expenses recorded"
                description="Track rent, utilities and supplies to see your true profit."
                action={<Button asChild size="sm" variant="outline"><Link to="/librarian/finance/expenses">Add expense</Link></Button>}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seat utilisation</CardTitle>
            <CardDescription>{seats.total ? `${seats.occupied} of ${seats.total} seats taken` : 'No seats configured'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, seats.utilization || 0)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatNumber(seats.available)} available</span>
              <span>{formatNumber(seats.maintenance)} maintenance</span>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/librarian/seats"><LayoutGrid className="h-4 w-4" /> Open seat map</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee health</CardTitle>
            <CardDescription>{periodToLabel(currentPeriod())}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Expected</span>
              <span className="font-medium">{formatMoney(fees.expected, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Received</span>
              <span className="font-medium text-success">{formatMoney(fees.received, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending</span>
              <span className={`font-medium ${fees.pending > 0 ? 'text-destructive' : ''}`}>{formatMoney(fees.pending, currency)}</span>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/librarian/fees?status=unpaid"><AlertTriangle className="h-4 w-4" /> Follow up on dues</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Staff & payroll</CardTitle>
            <CardDescription>{dashboard?.employees?.total || 0} employee(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active</span>
              <span className="font-medium">{formatNumber(dashboard?.employees?.active)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">On leave</span>
              <span className="font-medium">{formatNumber(dashboard?.employees?.onLeave)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Salaries pending</span>
              <Badge tone={dashboard?.employees?.pendingSalaries ? 'warning' : 'success'}>
                {formatNumber(dashboard?.employees?.pendingSalaries)}
              </Badge>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/librarian/employees/salaries"><Banknote className="h-4 w-4" /> Run payroll</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {isLoading ? <LoadingBlock label="Loading your library’s numbers…" /> : null}
    </div>
  );
}
