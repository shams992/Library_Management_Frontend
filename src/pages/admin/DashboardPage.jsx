import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, Building2, CalendarClock, CheckCircle2, CircleDollarSign, Clock, CreditCard,
  IndianRupee, TrendingUp, TriangleAlert, Users, XCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { PlatformGrowthChart, IncomeExpenseChart } from '../../components/charts/index.js';
import { adminService, libraryService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney, formatNumber, formatPercent } from '../../utils/format.js';

/** Platform administration dashboard — the health of the whole SaaS. */
export default function AdminDashboardPage() {
  const currency = useCurrency();

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
      <PageHeader
        title="Platform overview"
        description="Libraries, revenue, growth and everything that needs your attention today."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/admin/libraries?status=pending">Review pending <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild>
              <Link to="/admin/payments"><CircleDollarSign className="h-4 w-4" /> Record a payment</Link>
            </Button>
          </>
        }
      />

      {libraries.pending ? (
        <Alert
          tone="warning"
          title={`${libraries.pending} library application(s) waiting for approval`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/libraries?status=pending">Review now</Link>
            </Button>
          }
        >
          New libraries start with a {dashboard?.platform?.trialMonths ?? 1}-month free trial once approved.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total libraries"
          value={formatNumber(libraries.total)}
          hint={`${formatNumber(libraries.active)} active · ${formatNumber(libraries.trial)} on trial`}
          icon={Building2}
          tone="primary"
          loading={isLoading}
        />
        <StatCard
          label="Monthly recurring revenue"
          value={formatMoney(revenueData.mrr, currency, { compact: true })}
          hint={`${formatNumber(libraries.active)} paying · ${formatMoney(revenueData.priceMonthly, currency)} per library`}
          icon={TrendingUp}
          tone="success"
          loading={isLoading}
        />
        <StatCard
          label="Collected this month"
          value={formatMoney(revenueData.thisMonth, currency, { compact: true })}
          hint={revenueData.lastMonth ? `Last month ${formatMoney(revenueData.lastMonth, currency, { compact: true })}` : ''}
          icon={IndianRupee}
          tone="info"
          loading={isLoading}
        />
        <StatCard
          label="Students on the platform"
          value={formatNumber(studentTotals.total)}
          hint={`${formatNumber(studentTotals.active)} active · ${formatNumber(studentTotals.pending)} pending`}
          icon={Users}
          tone="primary"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="On free trial" value={formatNumber(libraries.trial)} icon={Clock} tone="warning" loading={isLoading} />
        <StatCard label="Payment due" value={formatNumber(libraries.paymentDue)} icon={CalendarClock} tone={libraries.paymentDue ? 'destructive' : 'default'} loading={isLoading} />
        <StatCard label="Suspended" value={formatNumber(libraries.suspended)} icon={TriangleAlert} tone="muted" loading={isLoading} />
        <StatCard
          label="Trial → paid conversion"
          value={libraries.conversionRate !== undefined ? formatPercent(libraries.conversionRate) : '—'}
          hint="Trial libraries that became paying customers"
          icon={BadgeCheck}
          tone="success"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Platform growth</CardTitle>
            <CardDescription>New libraries and students per month</CardDescription>
          </CardHeader>
          <CardContent>
                        {isLoading ? (
              <div className="skeleton h-[300px] rounded-xl" />
            ) : (
              <PlatformGrowthChart
                data={revenue?.data?.growth || dashboard?.growth || []}
                keys={[
                  { key: 'libraries', label: 'New libraries', colour: 'hsl(var(--primary))' },
                  { key: 'students', label: 'New students', colour: 'hsl(var(--accent))' },
                ]}
                height={300}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription revenue</CardTitle>
            <CardDescription>Collected vs expected, last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="skeleton h-[300px] rounded-xl" />
            ) : (
              <IncomeExpenseChart data={(revenue?.data?.series || []).map((row) => ({ ...row, income: row.amount, expense: row.expected }))} height={300} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Waiting for approval</CardTitle>
              <CardDescription>Review and start their trial</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/libraries?status=pending">All pending</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingBlock label="Loading…" />
            ) : pending.length === 0 ? (
              <EmptyState
                compact
                illustration="libraries"
                title="No pending applications 🎉"
                description="Every library registration has been reviewed."
              />
            ) : (
              <ul className="divide-y divide-border">
                {pending.slice(0, 5).map((library) => (
                  <li key={library.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link to={`/admin/libraries/${library.id}`} className="truncate text-sm font-medium hover:text-primary">
                        {library.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {library.city} · {library.ownerName} · {library.phone} · applied {formatDate(library.createdAt, { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="xs" loading={approveMutation.isPending && approveMutation.variables === library.id} onClick={() => approveMutation.mutate(library.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Newest libraries</CardTitle>
              <CardDescription>Recently registered on the platform</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/admin/libraries">All libraries</Link></Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingBlock label="Loading…" />
            ) : dashboard?.recentLibraries?.length ? (
              <ul className="divide-y divide-border">
                {dashboard.recentLibraries.map((library) => (
                  <li key={library.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link to={`/admin/libraries/${library.id}`} className="truncate text-sm font-medium hover:text-primary">
                        {library.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {library.city} · {formatNumber(library.stats?.totalStudents || 0)} student(s) ·{' '}
                        {formatNumber(library.stats?.occupiedSeats || 0)}/{formatNumber(library.stats?.totalSeats || 0)} seats
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={library.status} kind="library" />
                      {library.subscription?.status === 'trial' && library.subscription?.trialEndDate ? (
                        <Badge tone="info">trial ends {formatDate(library.subscription.trialEndDate, { day: '2-digit', month: 'short' })}</Badge>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact illustration="libraries" title="No libraries yet" description="Libraries appear here as soon as they register." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Latest subscription payments</CardTitle>
            <CardDescription>Money received by the platform</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/admin/payments">All payments</Link></Button>
        </CardHeader>
        <CardContent>
          {revenueData.recentPayments?.length ? (
            <ul className="divide-y divide-border">
              {revenueData.recentPayments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{payment.libraryName}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.invoiceNumber} · {formatDate(payment.paidAt)} · {payment.method?.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="font-medium text-success">{formatMoney(payment.amount, currency)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact illustration="finance" title="No subscription payments yet" description="Record a payment from a library’s page to see it here." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
