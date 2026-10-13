import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Banknote, CalendarPlus, Download, Search, SlidersHorizontal, Users, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Toolbar, ToolbarGroup } from '../../components/common/Toolbar.jsx';
import { Card } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { employeeService, financeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { currentPeriod, formatMoney, formatNumber, periodOptions, periodToLabel } from '../../utils/format.js';
import { SalaryPaymentDialog } from '../../components/employees/SalaryPaymentDialog.jsx';

export default function SalariesPage() {
  const currency = useCurrency();
  const periods = useMemo(() => periodOptions(18), []);
  const [period, setPeriod] = useState(currentPeriod());
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [payTarget, setPayTarget] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [generateOpen, setGenerateOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employees', 'salaries', { period, status, search: debouncedSearch, page, limit }],
    queryFn: () => employeeService.salaries({ period, status, search: debouncedSearch, page, limit }),
    keepPreviousData: true,
  });

  const salaries = data?.data || [];
  const meta = data?.meta;
  const payroll = meta?.payrollSummary || {};

  const generateMutation = useApiMutation({
    mutationFn: (payload) => employeeService.generateSalaries(payload),
    invalidate: ['employees', 'dashboard', 'finance', 'expenses'],
    successMessage: (response) => response?.message || 'Salaries generated',
    onSuccess: () => { setGenerateOpen(false); refetch(); },
  });

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (row) => (
        <div className="text-sm">
          <Link to={`/librarian/employees/${row.employeeId}`} className="font-medium hover:text-primary">{row.employeeName}</Link>
          <p className="text-xs text-muted-foreground">{row.position || '—'}</p>
        </div>
      ),
    },
    { key: 'periodLabel', label: 'Month', render: (row) => <span className="text-sm">{row.periodLabel || periodToLabel(row.periodKey)}</span> },
    { key: 'amount', label: 'Base', align: 'right', render: (row) => <span className="tabular-nums">{formatMoney(row.amount, currency)}</span> },
    {
      key: 'adjustments',
      label: 'Bonus / deduction',
      align: 'right',
      render: (row) => (
        <span className="text-xs tabular-nums">
          {row.bonus ? <span className="text-success">+{formatMoney(row.bonus, currency)}</span> : null}
          {row.deduction ? <span className="ml-2 text-destructive">−{formatMoney(row.deduction, currency)}</span> : null}
          {!row.bonus && !row.deduction ? <span className="text-muted-foreground">—</span> : null}
        </span>
      ),
    },
    { key: 'netAmount', label: 'Net payable', align: 'right', render: (row) => <span className="font-medium tabular-nums">{formatMoney(row.netAmount, currency)}</span> },
    { key: 'paidAmount', label: 'Paid', align: 'right', render: (row) => <span className="tabular-nums text-success">{formatMoney(row.paidAmount, currency)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} kind="salary" />
          {row.payments?.length ? <p className="text-xs text-muted-foreground">{row.payments.length} payment(s)</p> : null}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="xs" variant="ghost" onClick={() => setAdjustTarget(row)}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
          {row.status !== 'paid' ? <Button size="xs" onClick={() => setPayTarget(row)}>Pay</Button> : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salaries"
        description="Run payroll for the month, adjust bonus or deductions, then record payments as they are made."
        actions={
          <>
            <Button variant="outline" onClick={() => financeService.exportReport('salaries', { period })} className="hidden sm:inline-flex">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setGenerateOpen(true)}>
              <CalendarPlus className="h-4 w-4" /> Generate {periodToLabel(period, { short: true })}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Payroll — ${periodToLabel(period, { short: true })}`} value={formatMoney(payroll.payable, currency, { compact: true })} hint={`${formatNumber(payroll.count)} salary record(s)`} icon={Wallet} tone="primary" loading={isLoading} />
        <StatCard label="Paid out" value={formatMoney(payroll.paid, currency, { compact: true })} icon={Banknote} tone="success" loading={isLoading} />
        <StatCard label="Still payable" value={formatMoney(payroll.pending, currency, { compact: true })} icon={Users} tone={payroll.pending > 0 ? 'destructive' : 'default'} loading={isLoading} />
        <StatCard
          label="Coverage"
          value={payroll.payable ? `${Math.round((payroll.paid / payroll.payable) * 100)}%` : '—'}
          hint="Share of this month’s payroll already paid"
          icon={Banknote}
          tone="info"
          loading={isLoading}
        />
      </div>

      <Card>
        <div className="border-b border-border p-4">
          <Toolbar>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search employee…"
                className="pl-9"
                aria-label="Search salaries"
              />
            </div>
            <ToolbarGroup>
              <Select value={period} onValueChange={(value) => { setPeriod(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[170px]" aria-label="Month"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[150px]" aria-label="Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </ToolbarGroup>
          </Toolbar>
        </div>

        <DataTable
          columns={columns}
          rows={salaries}
          loading={isLoading}
          emptyState={
            <EmptyState
              illustration="employees"
              title={`No salaries generated for ${periodToLabel(period)}`}
              description="Generate salaries for every active employee in one click — nothing is duplicated if you run it twice."
              action={<Button onClick={() => setGenerateOpen(true)}><CalendarPlus className="h-4 w-4" /> Generate salaries</Button>}
            />
          }
          mobileCard={(row) => (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{row.employeeName}</p>
                  <p className="text-xs text-muted-foreground">{row.position} · {row.periodLabel}</p>
                </div>
                <StatusBadge status={row.status} kind="salary" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Net {formatMoney(row.netAmount, currency)}</span>
                <span className={row.paidAmount >= row.netAmount ? 'text-success' : 'text-destructive'}>Paid {formatMoney(row.paidAmount, currency)}</span>
              </div>
              {row.status !== 'paid' ? (
                <Button size="xs" className="w-full" onClick={() => setPayTarget(row)}>
                  <Banknote className="h-3.5 w-3.5" /> Record payment
                </Button>
              ) : null}
            </div>
          )}
        />

        {salaries.length ? <Pagination meta={meta} entity="salary records" onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} /> : null}
      </Card>

      <Alert tone="info" title="Paid salaries post to your expense ledger">
        When you record a salary payment, the amount is added to the month’s expenses automatically — so profit figures stay
        accurate without any double entry.
      </Alert>

      <GenerateSalariesDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        defaultPeriod={period}
        loading={generateMutation.isPending}
        onConfirm={(payload) => generateMutation.mutate(payload)}
      />

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

const GenerateSalariesDialog = ({ open, onOpenChange, defaultPeriod, onConfirm, loading }) => {
  const periods = useMemo(() => periodOptions(12), []);
  const [period, setPeriod] = useState(defaultPeriod);
  const [bonusPercent, setBonusPercent] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate salaries</DialogTitle>
          <DialogDescription>
            Creates one salary record per active employee for the selected month, using their own salary. Re-running is safe —
            existing records are skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Month" htmlFor="gen-sal-period">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="gen-sal-period"><SelectValue /></SelectTrigger>
              <SelectContent>
                {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Bonus percentage" htmlFor="gen-sal-bonus" hint="Optional — e.g. 10 adds a 10% Eid bonus to everyone.">
            <Input id="gen-sal-bonus" type="number" min={0} max={100} value={bonusPercent} onChange={(e) => setBonusPercent(Number(e.target.value))} />
          </Field>

          <Alert tone="info" icon>
            You can fine-tune each employee’s bonus or deduction afterwards, before paying.
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button loading={loading} onClick={() => onConfirm({ period, bonusPercent })}>
            <CalendarPlus className="h-4 w-4" /> Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
          <DialogDescription>{salary.employeeName} · {salary.periodLabel || periodToLabel(salary.periodKey)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Base" htmlFor="sal-adj-amount">
              <Input id="sal-adj-amount" type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
            <Field label="Bonus" htmlFor="sal-adj-bonus">
              <Input id="sal-adj-bonus" type="number" min={0} value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} />
            </Field>
            <Field label="Deduction" htmlFor="sal-adj-deduction">
              <Input id="sal-adj-deduction" type="number" min={0} value={form.deduction} onChange={(e) => setForm({ ...form, deduction: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes" htmlFor="sal-adj-notes">
            <Input id="sal-adj-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Reason for the adjustment" />
          </Field>
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">New net payable</span>
              <span className="font-semibold">{formatMoney(net, currency)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={() => mutation.mutate(form)}>
            <SlidersHorizontal className="h-4 w-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
