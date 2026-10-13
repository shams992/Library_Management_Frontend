import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarClock, CreditCard, RefreshCw, TriangleAlert, Wallet, Zap } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { AdminActionDialog } from '../../components/admin/AdminActionDialog.jsx';
import { VerificationStatusBadge } from '../../components/common/VerificationWorkflow.jsx';
import { libraryService, settingsService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney, formatNumber, daysLeftLabel } from '../../utils/format.js';

const FILTERS = [
  { value: 'all', label: 'All subscriptions' },
  { value: 'trial', label: 'On trial' },
  { value: 'active', label: 'Active' },
  { value: 'payment_due', label: 'Payment due' },
  { value: 'suspended', label: 'Suspended' },
];

/** Subscription lifecycle board: who is paying, who is due, who needs a nudge. */
export default function AdminSubscriptionsPage() {
  const currency = useCurrency();
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['libraries', 'admin', 'subscriptions', { status, page }],
    queryFn: () => libraryService.adminList({ status, page, limit: 20, sortBy: 'trialEnd' }),
    keepPreviousData: true,
  });

  const libraries = data?.data || [];
  const meta = data?.meta;
  const counts = meta?.counts || {};

  const sweepMutation = useApiMutation({
    mutationFn: (dryRun) => settingsService.billingSweep({ dryRun }),
    invalidate: ['libraries', 'admin', 'settings'],
    successMessage: (response) => response?.message || 'Billing sweep completed',
    onSuccess: () => refetch(),
  });

  const columns = [
    {
      key: 'name',
      label: 'Library',
      render: (row) => (
        <div className="text-sm">
          <Link to={`/admin/libraries/${row.id}`} className="font-medium hover:text-primary">{row.name}</Link>
          <p className="text-xs text-muted-foreground">{row.city} · {row.ownerName}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Subscription',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={row.subscription?.status || row.status} kind="library" />
          {row.subscription?.status === 'trial' ? (
            <Badge tone="info">{daysLeftLabel(Math.max(0, Math.ceil((new Date(row.subscription.trialEndDate).getTime() - Date.now()) / 86_400_000)))}</Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: 'verification',
      label: 'Verification',
      render: (row) => (
        <div className="flex flex-col items-start gap-1">
          <VerificationStatusBadge status={row.subscription?.verificationStatus || 'pending_payment'} />
          {row.subscription?.paymentSubmission?.reference ? (
            <span className="font-mono text-[0.68rem] text-muted-foreground truncate max-w-[120px]" title={`Ref: ${row.subscription.paymentSubmission.reference}`}>
              Ref: {row.subscription.paymentSubmission.reference}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Monthly amount',
      align: 'right',
      render: (row) => <span className="text-sm font-medium">{formatMoney(row.subscription?.amount || 0, currency)}</span>,
    },
    {
      key: 'nextPaymentDate',
      label: 'Next payment',
      render: (row) => {
        const date = row.subscription?.nextPaymentDate;
        const overdue = date && new Date(date) < new Date() && row.status !== 'trial';
        return (
          <span className={`text-sm ${overdue ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
            {date ? formatDate(date) : '—'}{overdue ? ' · overdue' : ''}
          </span>
        );
      },
    },
    {
      key: 'totalPaid',
      label: 'Paid to date',
      align: 'right',
      render: (row) => <span className="text-sm text-success">{formatMoney(row.totalPaid || 0, currency)}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="xs"
            variant={['payment_submitted', 'under_review'].includes(row.subscription?.verificationStatus) ? 'default' : 'outline'}
            onClick={() => setAction({ type: 'verifyPayment', library: row })}
          >
            Verify
          </Button>
          <Button size="xs" onClick={() => setAction({ type: 'recordPayment', library: row })}>Record payment</Button>
          {row.status === 'suspended' ? (
            <Button size="xs" variant="outline" onClick={() => setAction({ type: 'activate', library: row })}>Restore</Button>
          ) : (
            <Button size="xs" variant="ghost" onClick={() => setAction({ type: 'extend', library: row })}>Extend</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Trials, renewals and overdue accounts — the commercial health of the platform."
        actions={
          <>
            <Button variant="outline" onClick={() => sweepMutation.mutate(true)} loading={sweepMutation.isPending}>
              <Zap className="h-4 w-4" /> Billing sweep (preview)
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/subscriptions/controls"><RefreshCw className="h-4 w-4" /> Billing controls</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="On trial" value={formatNumber(counts.trial)} icon={CalendarClock} tone="info" loading={isLoading} />
        <StatCard label="Active (paying)" value={formatNumber(counts.active)} icon={Wallet} tone="success" loading={isLoading} />
        <StatCard label="Payment due" value={formatNumber(counts.payment_due)} icon={TriangleAlert} tone={counts.payment_due ? 'destructive' : 'default'} loading={isLoading} />
        <StatCard label="Suspended" value={formatNumber(counts.suspended)} icon={CreditCard} tone="muted" loading={isLoading} />
      </div>

      <Alert tone="info" title="How the billing sweep works">
        It moves trials that have ended to “payment due”, moves overdue accounts into “suspended” after the grace period, and
        notifies each librarian. Running the preview first shows you exactly what would change.
      </Alert>

      <Card>
        <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>All subscriptions</CardTitle>
            <CardDescription>{isLoading ? 'Loading…' : `${formatNumber(meta?.total ?? 0)} library subscription(s)`}</CardDescription>
          </div>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter subscriptions"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FILTERS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="pt-0">
          <DataTable
            columns={columns}
            rows={libraries}
            loading={isLoading}
            emptyState={
              <EmptyState
                illustration="finance"
                title="No subscriptions in this state"
                description="Switch the filter to see other libraries, or approve a pending application to start a trial."
                action={<Button variant="outline" onClick={() => setStatus('all')}>Show all subscriptions</Button>}
              />
            }
            mobileCard={(row) => (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.city}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={row.subscription?.status || row.status} kind="library" />
                    <VerificationStatusBadge status={row.subscription?.verificationStatus || 'pending_payment'} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatMoney(row.subscription?.amount || 0, currency)}/month</span>
                  <span>{row.subscription?.nextPaymentDate ? `next ${formatDate(row.subscription.nextPaymentDate)}` : '—'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <Button
                    size="xs"
                    variant={['payment_submitted', 'under_review'].includes(row.subscription?.verificationStatus) ? 'default' : 'outline'}
                    onClick={() => setAction({ type: 'verifyPayment', library: row })}
                  >
                    Verify
                  </Button>
                  <Button size="xs" onClick={() => setAction({ type: 'recordPayment', library: row })}>
                    Record payment
                  </Button>
                </div>
              </div>
            )}
          />

          {libraries.length ? <Pagination meta={meta} entity="subscriptions" onPageChange={setPage} /> : null}
        </CardContent>
      </Card>

      <AdminActionDialog action={action} onClose={() => setAction(null)} onDone={() => refetch()} />
    </div>
  );
}
