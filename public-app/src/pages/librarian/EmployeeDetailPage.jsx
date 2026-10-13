import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Banknote, BriefcaseBusiness, CalendarCheck, CalendarDays, CheckCircle2, Copy, KeyRound, Mail, MapPin, Phone,
  RefreshCw, SlidersHorizontal, UserCog, Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Avatar, AvatarFallback, Separator } from '../../components/ui/misc.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { employeeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { currentPeriod, formatDate, formatMoney, formatNumber, initials, periodOptions, periodToLabel } from '../../utils/format.js';
import { EmployeeFormDialog } from '../../components/employees/EmployeeFormDialog.jsx';
import { SalaryPaymentDialog } from '../../components/employees/SalaryPaymentDialog.jsx';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currency = useCurrency();
  const periods = useMemo(() => periodOptions(12), []);
  const [period, setPeriod] = useState(currentPeriod());
  const [editOpen, setEditOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['employees', id, { period }],
    queryFn: () => employeeService.detail(id, { period }),
    enabled: Boolean(id),
  });

  const employee = data?.data?.employee;
  const salaries = data?.data?.salaries || [];
  const attendance = data?.data?.attendance || [];
  const totals = data?.data?.totals || {};

  const archiveMutation = useApiMutation({
    mutationFn: (payload) => employeeService.archive(id, payload),
    invalidate: ['employees', 'dashboard', 'finance'],
    successMessage: (response) => response?.message || 'Employee updated',
    onSuccess: () => refetch(),
  });

  if (isLoading) return <LoadingBlock label="Loading employee…" className="min-h-[50vh]" />;
  if (isError || !employee) {
    return (
      <EmptyState
        illustration="search"
        title="Employee not found"
        description={error?.message || 'This employee may belong to another library.'}
        action={<Button onClick={() => navigate('/librarian/employees')}>Back to employees</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/librarian/employees"><ArrowLeft className="h-4 w-4" /> All employees</Link>
      </Button>

      <PageHeader
        title={employee.fullName}
        description={`${employee.position}${employee.department ? ` · ${employee.department}` : ''} · joined ${formatDate(employee.joiningDate)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <UserCog className="h-4 w-4" /> Edit details
            </Button>
            {employee.status === 'active' ? (
              <Button variant="outline" onClick={() => archiveMutation.mutate({ status: 'on_leave' })} loading={archiveMutation.isPending}>
                Mark on leave
              </Button>
            ) : (
              <Button variant="success" onClick={() => archiveMutation.mutate({ status: 'active' })} loading={archiveMutation.isPending}>
                <CheckCircle2 className="h-4 w-4" /> Mark active
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/librarian/employees/salaries"><Banknote className="h-4 w-4" /> Payroll</Link>
            </Button>
          </>
        }
      />

      {employee.status !== 'active' ? (
        <Alert tone="warning" title={`This employee is marked “${employee.status.replace('_', ' ')}”`}>
          {employee.leavingDate ? `Leaving date recorded: ${formatDate(employee.leavingDate)}. ` : ''}
          Historic salary records are kept for your accounts.
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-5 p-5 pt-5">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{initials(employee.fullName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{employee.fullName}</h2>
                    <StatusBadge status={employee.status} kind="employee" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {employee.employeeCode || '—'}{employee.fatherName ? ` · s/o ${employee.fatherName}` : ''}
                  </p>
                </div>
                <Badge tone="success">{formatMoney(employee.salary, currency)} / {employee.salaryType}</Badge>
              </div>

              <Separator />

              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Phone, label: 'Phone', value: employee.phone },
                  { icon: Mail, label: 'Email', value: employee.email || '—' },
                  { icon: BriefcaseBusiness, label: 'Position', value: employee.position },
                  { icon: CalendarDays, label: 'Joining date', value: formatDate(employee.joiningDate) },
                  { icon: MapPin, label: 'Address', value: employee.address || '—' },
                  { icon: Wallet, label: 'Salary type', value: employee.salaryType },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2.5">
                    <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</dt>
                      <dd className="truncate text-sm capitalize">{row.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              {employee.notes ? (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
                    <p className="mt-1 text-sm text-muted-foreground">{employee.notes}</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Salary history</CardTitle>
                <CardDescription>Net payable, paid and pending — month by month</CardDescription>
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[170px]" aria-label="Filter by month"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="pt-0">
              {salaries.length === 0 ? (
                <EmptyState
                  compact
                  illustration="employees"
                  title="No salary records"
                  description="Generate this month’s salary from the payroll page — you can adjust bonus or deduction afterwards."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Base</TableHead>
                      <TableHead className="text-right">Bonus / ded.</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaries.map((salary) => (
                      <TableRow key={salary.id}>
                        <TableCell className="font-medium">{periodToLabel(salary.periodKey)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatMoney(salary.amount, currency)}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {salary.bonus ? <span className="text-success">+{formatMoney(salary.bonus, currency)}</span> : null}
                          {salary.deduction ? <span className="ml-2 text-destructive">−{formatMoney(salary.deduction, currency)}</span> : null}
                          {!salary.bonus && !salary.deduction ? <span className="text-muted-foreground">—</span> : null}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{formatMoney(salary.netAmount, currency)}</TableCell>
                        <TableCell className="text-right tabular-nums text-success">{formatMoney(salary.paidAmount, currency)}</TableCell>
                        <TableCell><StatusBadge status={salary.status} kind="salary" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="xs" variant="ghost" onClick={() => setAdjustTarget(salary)}>
                              <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust
                            </Button>
                            {salary.status !== 'paid' ? (
                              <Button size="xs" onClick={() => setPayTarget(salary)}>Pay</Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Recent attendance</CardTitle>
                <CardDescription>{attendance.length} record(s) loaded</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/librarian/employees/attendance">Mark attendance</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {attendance.length === 0 ? (
                <EmptyState compact illustration="employees" title="No attendance marked" description="Attendance is marked daily from the attendance page." />
              ) : (
                <ul className="divide-y divide-border">
                  {attendance.slice(0, 10).map((row) => (
                    <li key={row.id} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="text-muted-foreground">{formatDate(row.date, { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                      <span className="inline-flex items-center gap-2">
                        {row.checkIn ? <span className="text-xs text-muted-foreground">{row.checkIn} – {row.checkOut || '…'}</span> : null}
                        <StatusBadge status={row.status} kind="attendance" />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" /> Staff Portal Login
              </CardTitle>
              <CardDescription>
                Staff sign in using their Gmail and this code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm pt-0">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Staff Gmail</span>
                <p className="font-mono text-sm font-semibold">{employee.email || '—'}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Login Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800 tracking-wider">
                    {employee.loginCode || '—'}
                  </span>
                  {employee.loginCode ? (
                    <Button
                      size="xs"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => {
                        navigator.clipboard.writeText(employee.loginCode);
                        toast.success('Login code copied to clipboard!');
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  ) : null}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-center gap-2 rounded-xl mt-1 text-xs"
                onClick={async () => {
                  try {
                    const res = await employeeService.regenerateCode(employee.id);
                    toast.success(res?.message || 'New login code generated!');
                    refetch();
                  } catch (err) {
                    toast.error(err.message || 'Failed to regenerate code');
                  }
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate Login Code
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payroll summary</CardTitle>
              <CardDescription>All time, for this employee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Salaries generated</span>
                <span className="font-medium">{formatNumber(totals.salaryCount ?? salaries.length)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total paid</span>
                <span className="font-medium text-success">{formatMoney(totals.totalPaid, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Still unpaid</span>
                <span className={`font-medium ${totals.totalPending > 0 ? 'text-destructive' : ''}`}>{formatMoney(totals.totalPending, currency)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Attendance marked</span>
                <span className="font-medium">{formatNumber(totals.attendanceDays)} day(s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Present days</span>
                <span className="font-medium text-success">{formatNumber(totals.presentDays)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/librarian/employees/salaries"><Banknote className="h-4 w-4" /> Salary records</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/librarian/employees/attendance"><CalendarCheck className="h-4 w-4" /> Attendance register</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/librarian/finance/expenses"><Wallet className="h-4 w-4" /> Expense ledger</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <EmployeeFormDialog open={editOpen} onOpenChange={setEditOpen} employee={employee} onDone={() => refetch()} />

      <SalaryAdjustDialog
        salary={adjustTarget}
        open={Boolean(adjustTarget)}
        onOpenChange={(open) => { if (!open) setAdjustTarget(null); }}
        onDone={() => refetch()}
      />

      <SalaryPaymentDialog
        salary={payTarget}
        open={Boolean(payTarget)}
        onOpenChange={(open) => { if (!open) setPayTarget(null); }}
        onDone={() => refetch()}
      />
    </div>
  );
}

/** Adjust a generated salary: base amount, bonus, deduction or notes. */
const SalaryAdjustDialog = ({ salary, open, onOpenChange, onDone }) => {
  const currency = useCurrency();
  const [form, setForm] = useState({ amount: 0, bonus: 0, deduction: 0, notes: '' });

  const mutation = useApiMutation({
    mutationFn: (payload) => employeeService.updateSalary(salary.id, payload),
    invalidate: ['employees', 'dashboard', 'finance', 'expenses'],
    successMessage: 'Salary adjusted',
    onSuccess: () => { onOpenChange(false); onDone?.(); },
  });

  if (!salary) return null;

  const net = Math.max(0, Number(form.amount || 0) + Number(form.bonus || 0) - Number(form.deduction || 0));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setForm({ amount: salary.amount || 0, bonus: salary.bonus || 0, deduction: salary.deduction || 0, notes: salary.notes || '' });
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust salary</DialogTitle>
          <DialogDescription>
            {salary.employeeName} · {periodToLabel(salary.periodKey)} — changes recompute the net automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Base" htmlFor="adj-amount">
              <Input id="adj-amount" type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
            <Field label="Bonus" htmlFor="adj-bonus">
              <Input id="adj-bonus" type="number" min={0} value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} />
            </Field>
            <Field label="Deduction" htmlFor="adj-deduction">
              <Input id="adj-deduction" type="number" min={0} value={form.deduction} onChange={(e) => setForm({ ...form, deduction: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes" htmlFor="adj-notes">
            <Input id="adj-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. 2 unpaid leave days deducted" />
          </Field>

          <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Net payable after adjustment</span>
              <span className="font-semibold">{formatMoney(net, currency)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-muted-foreground">Already paid</span>
              <span className="font-medium">{formatMoney(salary.paidAmount, currency)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={() => mutation.mutate(form)}>
            <SlidersHorizontal className="h-4 w-4" /> Save adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
