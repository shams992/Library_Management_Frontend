import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Armchair, Bell, CalendarDays, CreditCard, Info, Receipt, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Separator } from '../../components/ui/misc.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { portalService, notificationService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate, formatMoney, formatNumber, periodToLabel } from '../../utils/format.js';

/** Student home: seat, current dues and everything the library shared with them. */
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

  if (isLoading) return <LoadingBlock label="Loading your dashboard…" className="min-h-[50vh]" />;
  if (isError) return <Alert tone="destructive" title="Dashboard unavailable">{error?.message}</Alert>;

  const currentFee = overview?.currentFee;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Assalam-o-Alaikum, ${student?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}`}
        description={
          library
            ? `${library.name} · ${library.city} · timings ${library.openingTime} – ${library.closingTime}`
            : 'Your library dashboard'
        }
        actions={
          <Button asChild>
            <Link to="/student/fees"><Receipt className="h-4 w-4" /> My fee records</Link>
          </Button>
        }
      />

      {currentFee && currentFee.status !== 'paid' ? (
        <Alert
          tone={currentFee.status === 'unpaid' ? 'warning' : 'info'}
          title={`Fee for ${periodToLabel(currentFee.periodKey)} is ${currentFee.status === 'partial' ? 'partially paid' : 'unpaid'}`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/student/fees">See details</Link>
            </Button>
          }
        >
          Payable {formatMoney(currentFee.amount - (currentFee.discount || 0), currency)} · balance{' '}
          {formatMoney(Math.max(0, currentFee.amount - (currentFee.discount || 0) - currentFee.paidAmount), currency)}. Please pay
          at the counter — the librarian will record it instantly.
        </Alert>
      ) : null}

      {notifications?.data?.length ? (
        <Alert
          tone="info"
          title={`You have ${notifications.meta?.unread ?? notifications.data.length} unread notification(s)`}
          action={<Button asChild size="sm" variant="outline"><Link to="/student/notifications"><Bell className="h-3.5 w-3.5" /> View</Link></Button>}
        >
          {notifications.data[0]?.title}
          {notifications.data[0]?.message ? ` — ${notifications.data[0].message}` : ''}
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My seat"
          value={student?.seatNumber || 'Not assigned'}
          hint={student?.seatNumber ? 'Keep your seat tidy and quiet' : 'Ask the librarian to assign a seat'}
          icon={Armchair}
          tone={student?.seatNumber ? 'success' : 'warning'}
        />
        <StatCard
          label="Monthly fee"
          value={formatMoney(student?.monthlyFee, currency)}
          hint={student?.shift ? `Shift: ${student.shift.replace('_', ' ')}` : ''}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Total paid"
          value={formatMoney(totals.totalPaid, currency, { compact: true })}
          hint={`${formatNumber(totals.paymentCount)} payment(s)`}
          icon={CreditCard}
          tone="success"
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(totals.totalDue, currency, { compact: true })}
          hint={totals.totalDue > 0 ? 'Please clear at the counter' : 'All clear — thank you'}
          icon={Receipt}
          tone={totals.totalDue > 0 ? 'destructive' : 'success'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>My fee status</CardTitle>
              <CardDescription>Month-by-month record kept by your library</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/student/fees">Full history</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overview?.recentFees?.length ? (
              <ul className="divide-y divide-border">
                {overview.recentFees.map((fee) => (
                  <li key={fee.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{periodToLabel(fee.periodKey)}</p>
                      <p className="text-xs text-muted-foreground">
                        Paid {formatMoney(fee.paidAmount, currency)} of {formatMoney(fee.amount - (fee.discount || 0), currency)}
                      </p>
                    </div>
                    <StatusBadge status={fee.status} kind="fee" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact illustration="fees" title="No fee records yet" description="Your library will publish invoices here as they are generated." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My library</CardTitle>
              <CardDescription>Where you study</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Library</span>
                <span className="font-medium">{library?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">City</span>
                <span className="font-medium">{library?.city || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Timings</span>
                <span className="font-medium">{library ? `${library.openingTime} – ${library.closingTime}` : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{library?.phone || '—'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Student ID</span>
                <Badge tone="info">{student?.studentCode || '—'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{formatDate(student?.registrationDate)}</span>
              </div>
            </CardContent>
          </Card>

          <Alert tone="info" icon title="Keep your profile up to date">
            A correct phone number means the library can reach you about fee reminders. Update it from your profile page.
            <Button asChild size="sm" variant="outline" className="mt-3 w-full">
              <Link to="/student/profile">Update my details</Link>
            </Button>
          </Alert>

          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground inline-flex items-start gap-1.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Fees are paid directly to the library. This portal is a record of what the library has recorded for you.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
