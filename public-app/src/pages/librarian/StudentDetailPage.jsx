import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Banknote, CalendarDays, CheckCircle2, CreditCard, LayoutGrid, Mail, MapPin, Phone,
  ReceiptText, ShieldCheck, UserMinus, UserRound, Wallet, XCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Avatar, AvatarFallback, Separator } from '../../components/ui/misc.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Field } from '../../components/ui/label.jsx';
import { ConfirmDialog } from '../../components/ui/confirm-dialog.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Input } from '../../components/ui/input.jsx';
import { studentService, seatService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatDateTime, formatMoney, formatNumber, initials, periodToLabel } from '../../utils/format.js';
import { StudentFormDialog } from '../../components/students/StudentFormDialog.jsx';
import { FeePaymentDialog } from '../../components/fees/FeePaymentDialog.jsx';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currency = useCurrency();

  const [editOpen, setEditOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.detail(id),
    enabled: Boolean(id),
  });

  const { data: seatData } = useQuery({
    queryKey: ['seats', 'bookable'],
    queryFn: () => seatService.list({ bookable: 'true', limit: 100 }),
  });

  useEffect(() => {
    if (searchParams.get('approve') === '1') setApproveOpen(true);
  }, [searchParams]);

  const student = data?.data?.student;
  const fees = data?.data?.fees || [];
  const totals = data?.data?.totals || {};

  const seatMutation = useApiMutation({
    mutationFn: (seatId) => studentService.assignSeat(id, seatId),
    invalidate: ['students', 'seats', 'dashboard', 'library'],
    successMessage: (response) => response?.message || 'Seat updated',
    onSuccess: () => refetch(),
  });

  const reactivateMutation = useApiMutation({
    mutationFn: () => studentService.reactivate(id),
    invalidate: ['students', 'dashboard', 'seats', 'library'],
    successMessage: 'Student reactivated',
    onSuccess: () => refetch(),
  });

  if (isLoading) return <LoadingBlock label="Loading student…" className="min-h-[50vh]" />;
  if (isError || !student) {
    return (
      <EmptyState
        illustration="search"
        title="Student not found"
        description={error?.message || 'This student may belong to another library, or the record was removed.'}
        action={<Button onClick={() => navigate('/librarian/students')}>Back to students</Button>}
      />
    );
  }

  const seatOptions = (seatData?.data || []).filter(
    (seat) => !seat.studentId || String(seat.id) === String(student.seatId)
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/librarian/students"><ArrowLeft className="h-4 w-4" /> All students</Link>
      </Button>

      <PageHeader
        title={student.fullName}
        description={`${student.studentCode || 'Student'} · registered ${formatDate(student.registrationDate)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>Edit details</Button>
            {student.status === 'left' ? (
              <Button variant="success" onClick={() => reactivateMutation.mutate()} loading={reactivateMutation.isPending}>
                <CheckCircle2 className="h-4 w-4" /> Mark as active
              </Button>
            ) : (
              <Button variant="destructive" onClick={() => setLeaveOpen(true)}>
                <UserMinus className="h-4 w-4" /> Mark as left
              </Button>
            )}
          </>
        }
      />

      {student.status === 'pending' ? (
        <Alert
          tone="warning"
          title="This student applied online and is waiting for approval"
          action={
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setApproveOpen(true)}>
                <BadgeCheck className="h-4 w-4" /> Approve application
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </div>
          }
        >
          {student.requestedSeat ? `Requested seat: ${student.requestedSeat}. ` : ''}
          {student.shift ? `Shift preference: ${student.shift.replace('_', ' ')}. ` : ''}
          Approving activates the membership, assigns the chosen seat and creates the first monthly invoice.
        </Alert>
      ) : null}

      {student.status === 'rejected' ? (
        <Alert tone="destructive" title="This application was rejected">
          Reason: {student.rejectionReason || 'Application declined'}
        </Alert>
      ) : null}

      {student.status === 'left' && student.leaving ? (
        <Alert tone="info" title={`Left on ${formatDate(student.leaving.date)}`}>
          Reason: {student.leaving.reason || '—'}
          {student.leaving.refundAmount ? ` · security deposit refunded: ${formatMoney(student.leaving.refundAmount, currency)}` : ''}
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-5 p-5 pt-5">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{initials(student.fullName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{student.fullName}</h2>
                    <StatusBadge status={student.status} kind="student" />
                  </div>
                  <p className="text-sm capitalize text-muted-foreground">
                    s/o {student.fatherName || '—'} · {student.shift?.replace('_', ' ') || 'full day'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {student.seatNumber ? <Badge tone="info">Seat {student.seatNumber}</Badge> : <Badge tone="muted">No seat</Badge>}
                  <Badge tone="success">{formatMoney(student.monthlyFee, currency)} / month</Badge>
                </div>
              </div>

              <Separator />

              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Phone, label: 'Phone', value: student.phone },
                  { icon: Mail, label: 'Email', value: student.email || '—' },
                  { icon: ShieldCheck, label: 'CNIC', value: student.cnic || '—' },
                  { icon: UserRound, label: 'Guardian phone', value: student.guardianPhone || '—' },
                  { icon: MapPin, label: 'Address', value: student.address || '—' },
                  { icon: CalendarDays, label: 'Registration date', value: formatDate(student.registrationDate) },
                  { icon: Wallet, label: 'Security deposit', value: `${formatMoney(student.securityDeposit, currency)}${student.securityDepositPaid ? ' (paid)' : ' (unpaid)'}` },
                  { icon: ReceiptText, label: 'Fee start month', value: student.feeStartPeriod ? periodToLabel(student.feeStartPeriod) : '—' },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2.5">
                    <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</dt>
                      <dd className="truncate text-sm">{row.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              {student.notes ? (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
                    <p className="mt-1 text-sm text-muted-foreground">{student.notes}</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Fee history</CardTitle>
                <CardDescription>{fees.length} invoice(s) recorded for this student</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to={`/librarian/fees?studentId=${student.id}`}>Open in fees</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {fees.length === 0 ? (
                <EmptyState
                  compact
                  illustration="fees"
                  title="No invoices yet"
                  description="Generate the month’s invoices from the fees module, or record a one-off payment here."
                  action={<Button asChild size="sm" variant="outline"><Link to="/librarian/fees">Go to fees</Link></Button>}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Payable</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee) => {
                      const balance = Math.max(0, fee.amount - (fee.discount || 0) - fee.paidAmount);
                      return (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">{periodToLabel(fee.periodKey)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(fee.amount - (fee.discount || 0), currency)}</TableCell>
                          <TableCell className="text-right tabular-nums text-success">{formatMoney(fee.paidAmount, currency)}</TableCell>
                          <TableCell className={`text-right tabular-nums ${balance > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {formatMoney(balance, currency)}
                          </TableCell>
                          <TableCell><StatusBadge status={fee.status} kind="fee" /></TableCell>
                          <TableCell className="text-right">
                            {fee.status !== 'paid' ? (
                              <Button size="xs" onClick={() => setPayTarget(fee)}>Record payment</Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">{fee.payments?.length || 0} payment(s)</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {fees.some((fee) => fee.payments?.length) ? (
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payments received</p>
                  <ul className="mt-2 space-y-1.5">
                    {fees.flatMap((fee) => (fee.payments || []).map((payment) => ({ ...payment, periodKey: fee.periodKey }))).slice(0, 8).map((payment) => (
                      <li key={payment.id || `${payment.paidAt}-${payment.amount}`} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatDate(payment.paidAt)} · {periodToLabel(payment.periodKey, { short: true })} · {payment.method?.replace('_', ' ') || 'cash'}
                          {payment.reference ? ` · ${payment.reference}` : ''}
                        </span>
                        <span className="font-medium text-success">{formatMoney(payment.amount, currency)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seat</CardTitle>
              <CardDescription>{student.seatId ? `Currently on seat ${student.seatNumber}` : 'No seat assigned'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Assign / change seat" htmlFor="assign-seat">
                <Select
                  value={student.seatId || 'none'}
                  onValueChange={(value) => seatMutation.mutate(value === 'none' ? null : value)}
                  disabled={seatMutation.isPending}
                >
                  <SelectTrigger id="assign-seat"><SelectValue placeholder="Choose a seat" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Release seat (no seat)</SelectItem>
                    {seatOptions.map((seat) => (
                      <SelectItem key={seat.id} value={seat.id}>Seat {seat.number} · {seat.zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <p className="text-xs text-muted-foreground">
                {seatOptions.length} free seat(s) available. Assigning automatically releases the previous seat.
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/librarian/seats"><LayoutGrid className="h-4 w-4" /> View seat map</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account summary</CardTitle>
              <CardDescription>For this student, all time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoices</span>
                <span className="font-medium">{formatNumber(fees.length)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total paid</span>
                <span className="font-medium text-success">{formatMoney(totals.totalPaid, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Outstanding</span>
                <span className={`font-medium ${totals.totalDue > 0 ? 'text-destructive' : ''}`}>{formatMoney(totals.totalDue, currency)}</span>
              </div>
              <Separator />
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/librarian/fees?studentId=${student.id}`}><ReceiptText className="h-4 w-4" /> Manage invoices</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recorded by</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>Created {formatDateTime(student.createdAt)}</p>
              <p>Last updated {formatDateTime(student.updatedAt)}</p>
              <p className="inline-flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Every change is kept in the library’s audit trail.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <StudentFormDialog open={editOpen} onOpenChange={setEditOpen} student={student} />

      <FeePaymentDialog
        fee={payTarget}
        open={Boolean(payTarget)}
        onOpenChange={(open) => { if (!open) setPayTarget(null); }}
        onDone={() => refetch()}
      />

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title={`Mark ${student.fullName} as left?`}
        description={`Seat ${student.seatNumber || '—'} becomes free and the student moves to the “Left” list. All fee history stays intact and you can reactivate them any time.`}
        confirmLabel="Mark as left"
        onConfirm={() => {
          const reason = window.prompt('Reason for leaving (recorded in the audit trail):');
          if (!reason || reason.trim().length < 3) return;
          studentService.leave(student.id, { reason: reason.trim() }).then(() => { setLeaveOpen(false); refetch(); });
        }}
      />

      <ApproveApplicationDialog
        student={student}
        open={approveOpen}
        onOpenChange={setApproveOpen}
        seats={seatOptions}
        onDone={() => refetch()}
      />

      <RejectApplicationDialog
        student={student}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onDone={() => refetch()}
      />
    </div>
  );
}

/** Approve an online application: confirm fee + deposit and assign a seat in one step. */
const ApproveApplicationDialog = ({ student, open, onOpenChange, seats = [], onDone }) => {
  const currency = useCurrency();
  const [seatId, setSeatId] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(0);
  const [securityDeposit, setSecurityDeposit] = useState(0);

  useEffect(() => {
    if (open && student) {
      setSeatId('');
      setMonthlyFee(student.monthlyFee || 0);
      setSecurityDeposit(student.securityDeposit || 0);
    }
  }, [open, student]);

  const mutation = useApiMutation({
    mutationFn: (payload) => studentService.approveApplication(student.id, payload),
    invalidate: ['students', 'seats', 'fees', 'dashboard', 'library', 'notifications'],
    successMessage: 'Student approved successfully.',
    onSuccess: () => { onOpenChange(false); onDone?.(); },
    onError: (err) => { toast.error(err?.message || 'Failed to approve student'); },
  });

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approve application</DialogTitle>
          <DialogDescription>
            {student.fullName} · applied {formatDate(student.registrationDate)}. An invoice for the current month is created
            automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Monthly fee" htmlFor="app-fee" hint={`Currently ${formatMoney(student.monthlyFee, currency)} from the application.`}>
            <Input id="app-fee" type="number" min={0} value={monthlyFee} onChange={(e) => setMonthlyFee(Number(e.target.value))} />
          </Field>
          <Field label="Security deposit" htmlFor="app-deposit">
            <Input id="app-deposit" type="number" min={0} value={securityDeposit} onChange={(e) => setSecurityDeposit(Number(e.target.value))} />
          </Field>
          <Field label="Assign seat" htmlFor="app-seat" hint={`${seats.length} free seat(s) available`}>
            <Select value={seatId || 'none'} onValueChange={(value) => setSeatId(value === 'none' ? '' : value)}>
              <SelectTrigger id="app-seat"><SelectValue placeholder="Choose a free seat" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Decide later</SelectItem>
                {seats.map((seat) => <SelectItem key={seat.id} value={seat.id}>Seat {seat.number} · {seat.zone}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Alert tone="info">
            The student receives an approval notification and their study seat and fee details will be active in their Student Dashboard.
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ seatId: seatId || null, monthlyFee, securityDeposit })}
          >
            <BadgeCheck className="h-4 w-4" /> {mutation.isPending ? 'Saving...' : 'Approve student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Reject an online application: records reason and notifies the applicant. */
const RejectApplicationDialog = ({ student, open, onOpenChange, onDone }) => {
  const [reason, setReason] = useState('Seats currently at full capacity');

  const mutation = useApiMutation({
    mutationFn: (payload) => studentService.rejectApplication(student.id, payload),
    invalidate: ['students', 'dashboard', 'library', 'notifications'],
    successMessage: 'Application declined.',
    onSuccess: () => { onOpenChange(false); onDone?.(); },
  });

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <XCircle className="h-5 w-5" /> Reject Application
          </DialogTitle>
          <DialogDescription>
            Decline application from {student.fullName}. The applicant will be notified with the reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Field label="Rejection Reason" htmlFor="reject-reason">
            <Input
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Preferred shift full or library at capacity"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={mutation.isPending}
            onClick={() => mutation.mutate({ reason })}
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
