import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Building2, CalendarClock, CalendarPlus, CreditCard, History, LayoutGrid, Mail,
  MapPin, Phone, RefreshCw, ShieldCheck, ShieldOff, Trash2, Users, Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Separator } from '../../components/ui/misc.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { ConfirmDialog } from '../../components/ui/confirm-dialog.jsx';
import { AdminActionDialog } from '../../components/admin/AdminActionDialog.jsx';
import { VerificationStatusBadge } from '../../components/common/VerificationWorkflow.jsx';
import { libraryService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatDateTime, formatMoney, formatNumber } from '../../utils/format.js';

export default function AdminLibraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currency = useCurrency();
  const [action, setAction] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['libraries', 'admin', id],
    queryFn: () => libraryService.adminDetail(id),
    enabled: Boolean(id),
  });

  const library = data?.data?.library;
  const subscription = data?.data?.subscription || library?.subscription;
  const payments = data?.data?.payments || [];
  const auditTrail = data?.data?.auditTrail || [];
  const usage = data?.data?.usage || library?.stats || {};

  const recalcMutation = useApiMutation({
    mutationFn: () => libraryService.recalculate(id),
    invalidate: ['libraries', 'admin'],
    successMessage: 'Counters recalculated',
    onSuccess: () => refetch(),
  });

  const deleteMutation = useApiMutation({
    mutationFn: (confirm) => libraryService.remove(id, confirm),
    invalidate: ['libraries', 'admin'],
    successMessage: 'Library deleted',
    onSuccess: () => navigate('/admin/libraries'),
  });

  if (isLoading) return <LoadingBlock label="Loading library…" className="min-h-[50vh]" />;
  if (isError || !library) {
    return (
      <EmptyState
        illustration="search"
        title="Library not found"
        description={error?.message || 'This library may have been removed.'}
        action={<Button onClick={() => navigate('/admin/libraries')}>Back to libraries</Button>}
      />
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/admin/libraries"><ArrowLeft className="h-4 w-4" /> All libraries</Link>
      </Button>

      <PageHeader
        title={library.name}
        description={`${library.libraryType?.replace('_', ' ')} · ${library.city}${library.province ? `, ${library.province}` : ''} · registered ${formatDate(library.createdAt)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => recalcMutation.mutate()} loading={recalcMutation.isPending}>
              <RefreshCw className="h-4 w-4" /> Recalculate
            </Button>
            {library.status === 'pending' ? (
              <>
                <Button variant="success" onClick={() => setAction({ type: 'approve', library })}>
                  <BadgeCheck className="h-4 w-4" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => setAction({ type: 'reject', library })}>Reject</Button>
              </>
            ) : (
              <>
                <Button onClick={() => setAction({ type: 'recordPayment', library })}>
                  <CreditCard className="h-4 w-4" /> Record payment
                </Button>
                <Button variant="outline" onClick={() => setAction({ type: 'extend', library })}>
                  <CalendarPlus className="h-4 w-4" /> Extend
                </Button>
                {library.status === 'suspended' ? (
                  <Button variant="success" onClick={() => setAction({ type: 'activate', library })}>
                    <ShieldCheck className="h-4 w-4" /> Restore access
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => setAction({ type: 'suspend', library })}>
                    <ShieldOff className="h-4 w-4" /> Suspend
                  </Button>
                )}
              </>
            )}
          </>
        }
      />

      {library.status === 'suspended' ? (
        <Alert tone="destructive" title={`Suspended${library.suspensionReason ? ` — ${library.suspensionReason}` : ''}`}>
          Access is blocked for this library, but every student, seat, fee, salary and expense record is preserved. Restoring
          access requires no data recovery.
        </Alert>
      ) : null}

      {library.status === 'pending' ? (
        <Alert tone="warning" title="Waiting for approval">
          Approving starts the {data?.data?.platform?.trialMonths ?? 1}-month free trial. The library cannot use its dashboard until then.
        </Alert>
      ) : null}

      {library.status === 'rejected' && library.rejectionReason ? (
        <Alert tone="info" title="Application rejected">Reason recorded: {library.rejectionReason}</Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={formatNumber(usage.totalStudents ?? library.stats?.totalStudents)} hint={`${formatNumber(usage.activeStudents ?? library.stats?.activeStudents)} active`} icon={Users} tone="primary" />
        <StatCard
          label="Seats"
          value={`${formatNumber(library.stats?.occupiedSeats)} / ${formatNumber(library.stats?.totalSeats)}`}
          hint={`${formatNumber(library.stats?.totalSeats - library.stats?.occupiedSeats)} available`}
          icon={LayoutGrid}
          tone="info"
        />
        <StatCard label="Employees" value={formatNumber(library.stats?.totalEmployees)} icon={Building2} tone="muted" />
        <StatCard label="Subscription revenue" value={formatMoney(totalPaid, currency, { compact: true })} hint={`${payments.length} payment(s)`} icon={Wallet} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Library profile</CardTitle>
            <CardDescription>Details submitted at registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Users, label: 'Owner', value: library.ownerName },
                { icon: Phone, label: 'Phone', value: library.phone },
                { icon: Mail, label: 'Email', value: library.email },
                { icon: MapPin, label: 'Address', value: `${library.address}, ${library.city}` },
                { icon: CalendarClock, label: 'Timings', value: `${library.openingTime} – ${library.closingTime}` },
                { icon: LayoutGrid, label: 'Declared capacity', value: `${formatNumber(library.seatCapacity)} seats` },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-2.5">
                  <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</dt>
                    <dd className="truncate text-sm">{row.value || '—'}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {library.description ? (
              <>
                <Separator />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Description</p>
                  <p className="mt-1 text-sm text-muted-foreground">{library.description}</p>
                </div>
              </>
            ) : null}

            {library.facilities?.length ? (
              <>
                <Separator />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Facilities</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {library.facilities.map((facility) => <Badge key={facility} tone="muted">{facility}</Badge>)}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Lifecycle and billing state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={subscription?.status || library.status} kind="library" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verification status</span>
                <VerificationStatusBadge status={subscription?.verificationStatus || 'pending_payment'} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{formatMoney(subscription?.amount || 0, currency)} / month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trial ends</span>
                <span className="font-medium">{subscription?.trialEndDate ? formatDate(subscription.trialEndDate) : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next payment</span>
                <span className="font-medium">{subscription?.nextPaymentDate ? formatDate(subscription.nextPaymentDate) : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Grace period</span>
                <span className="font-medium">{subscription?.gracePeriodDays ?? '—'} day(s)</span>
              </div>

              {subscription?.paymentSubmission ? (
                <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-1.5 text-xs mt-2">
                  <div className="flex items-center justify-between font-medium text-foreground">
                    <span>Recent Payment Submission</span>
                    <span className="capitalize text-primary font-semibold">{subscription.paymentSubmission.method}</span>
                  </div>
                  <div className="text-muted-foreground space-y-0.5">
                    <p>Amount: <span className="font-medium text-foreground">{formatMoney(subscription.paymentSubmission.amount || 0, currency)}</span></p>
                    <p>Ref: <span className="font-mono font-medium text-foreground">{subscription.paymentSubmission.reference || '—'}</span></p>
                    {subscription.paymentSubmission.senderAccount ? (
                      <p>Sender: <span className="text-foreground">{subscription.paymentSubmission.senderAccount}</span></p>
                    ) : null}
                    {subscription.paymentSubmission.submittedAt ? (
                      <p>Date: {formatDate(subscription.paymentSubmission.submittedAt)}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={['payment_submitted', 'under_review'].includes(subscription?.verificationStatus) ? 'default' : 'outline'}
                  onClick={() => setAction({ type: 'verifyPayment', library: { ...library, subscription } })}
                >
                  Verify payment
                </Button>
                {library.status !== 'suspended' ? (
                  <Button size="sm" variant="outline" onClick={() => setAction({ type: 'markPaymentDue', library })}>
                    Mark payment due
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => setAction({ type: 'recordPayment', library })}>
                  Record payment
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAction({ type: 'extend', library })}>
                  Extend
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner account</CardTitle>
              <CardDescription>The librarian who manages this library</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{library.ownerUserId?.name || library.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="truncate font-medium">{library.ownerUserId?.email || library.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={library.ownerUserId?.status || 'active'} kind="user" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription payments</CardTitle>
            <CardDescription>Platform revenue from this library</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {payments.length === 0 ? (
              <EmptyState compact illustration="finance" title="No payments recorded" description="Record a payment when this library pays its subscription." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id || payment.invoiceNumber}>
                      <TableCell className="text-xs">
                        <p className="font-medium">{payment.invoiceNumber}</p>
                        <p className="text-muted-foreground">{payment.method?.replace('_', ' ')}{payment.reference ? ` · ${payment.reference}` : ''}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(payment.paidAt)}</TableCell>
                      <TableCell className="text-right font-medium">{formatMoney(payment.amount, currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Audit trail</CardTitle>
            <CardDescription>Who changed what, and when</CardDescription>
          </CardHeader>
          <CardContent>
            {auditTrail.length === 0 ? (
              <EmptyState compact illustration="reports" title="No audit entries" description="Lifecycle changes and edits will be listed here." />
            ) : (
              <ul className="divide-y divide-border">
                {auditTrail.map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium capitalize">{entry.action?.replace(/[._]/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.actorName || 'System'} · {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                    {entry.meta?.reason ? <Badge tone="muted">{entry.meta.reason}</Badge> : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Deleting removes the library and every record inside it. Suspension is almost always the better option, because it
            keeps the data and blocks access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete this library permanently
          </Button>
        </CardContent>
      </Card>

      <AdminActionDialog action={action} onClose={() => setAction(null)} onDone={() => refetch()} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${library.name}?`}
        description="This permanently removes the library, its students, seats, fees, employees and financial records. This cannot be undone."
        confirmLabel="Delete library"
        confirmPhrase={library.name}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(library.name)}
      />
    </div>
  );
}
