import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, Banknote, Bell, CalendarRange, Download, Plus, ReceiptText, RefreshCw, Search,
  TrendingUp, Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Toolbar, ToolbarGroup } from '../../components/common/Toolbar.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { FeeCollectionChart } from '../../components/charts/index.js';
import { feeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { currentPeriod, formatMoney, formatNumber, formatPercent, periodOptions, periodToLabel } from '../../utils/format.js';
import { FeeGeneratorDialog } from '../../components/fees/FeeGeneratorDialog.jsx';
import { FeePaymentDialog } from '../../components/fees/FeePaymentDialog.jsx';
import { FeeAdjustDialog } from '../../components/fees/FeeAdjustDialog.jsx';

const STATUS_TABS = [
  { value: 'all', label: 'All invoices' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export default function FeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currency = useCurrency();

  const [period, setPeriod] = useState(searchParams.get('period') || currentPeriod());
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [payTarget, setPayTarget] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);

  const studentId = searchParams.get('studentId') || undefined;
  const periods = useMemo(() => periodOptions(18), []);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['fees', { period, status, search: debouncedSearch, page, limit, studentId }],
    queryFn: () => feeService.list({ period, status, search: debouncedSearch, page, limit, studentId }),
    keepPreviousData: true,
  });

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['fees', 'overview', period],
    queryFn: () => feeService.overview({ period }),
  });

  const fees = data?.data || [];
  const meta = data?.meta;
  const summary = meta?.summary || {};
  const trend = overview?.data?.trend || [];

  const reminderMutation = useApiMutation({
    mutationFn: (payload) => feeService.reminders(payload),
    invalidate: ['fees', 'notifications'],
    successMessage: (response) => response?.message || 'Reminders sent',
  });

  const syncMutation = useApiMutation({
    mutationFn: () => feeService.syncOverdue(),
    invalidate: ['fees', 'students', 'dashboard', 'notifications'],
    successMessage: 'Overdue invoices refreshed',
    onSuccess: () => refetch(),
  });

  const updateFilter = (nextPeriod, nextStatus) => {
    const params = new URLSearchParams(searchParams);
    if (nextPeriod) params.set('period', nextPeriod);
    if (nextStatus && nextStatus !== 'all') params.set('status', nextStatus);
    else params.delete('status');
    setSearchParams(params, { replace: true });
  };

  const columns = [
    {
      key: 'studentName',
      label: 'Student',
      render: (row) => (
        <div className="text-sm">
          <Link to={`/librarian/students/${row.studentId}`} className="font-medium hover:text-primary">{row.studentName}</Link>
          <p className="text-xs text-muted-foreground">
            {row.studentCode || '—'}
            {row.seatNumber ? ` · Seat ${row.seatNumber}` : ''}
          </p>
        </div>
      ),
    },
    { key: 'periodKey', label: 'Period', render: (row) => <span className="text-sm">{periodToLabel(row.periodKey)}</span> },
    { key: 'amount', label: 'Payable', align: 'right', render: (row) => formatMoney(row.amount - (row.discount || 0), currency) },
    {
      key: 'paidAmount',
      label: 'Paid',
      align: 'right',
      render: (row) => <span className="text-success">{formatMoney(row.paidAmount, currency)}</span>,
    },
    {
      key: 'balance',
      label: 'Balance',
      align: 'right',
      render: (row) => {
        const balance = Math.max(0, row.amount - (row.discount || 0) - row.paidAmount);
        return <span className={balance > 0 ? 'font-medium text-destructive' : 'text-muted-foreground'}>{formatMoney(balance, currency)}</span>;
      },
    },
    { key: 'dueDate', label: 'Due', render: (row) => <span className="text-xs text-muted-foreground">{formatDateShort(row.dueDate)}</span> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.displayStatus || row.status} kind="fee" /> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status !== 'paid' ? <Button size="xs" onClick={() => setPayTarget(row)}>Pay</Button> : null}
          <Button size="xs" variant="ghost" onClick={() => setAdjustTarget(row)}>Adjust</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees"
        description={studentId ? 'Filtered to one student — remove the filter to see all invoices.' : 'Monthly invoices, partial payments, reminders and collection reports.'}
        actions={
          <>
            <Button variant="outline" onClick={() => reminderMutation.mutate({ period, onlyUnpaid: true })} loading={reminderMutation.isPending}>
              <Bell className="h-4 w-4" /> Send reminders
            </Button>
            <Button variant="outline" onClick={() => feeService.exportCsv()} className="hidden sm:inline-flex">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setGeneratorOpen(true)}>
              <Plus className="h-4 w-4" /> Generate invoices
            </Button>
          </>
        }
      />

      {studentId ? (
        <Alert tone="info" action={<Button size="xs" variant="outline" onClick={() => { const p = new URLSearchParams(searchParams); p.delete('studentId'); setSearchParams(p); }}>Show all students</Button>}>
          Showing invoices for one student only.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Expected — ${periodToLabel(period, { short: true })}`}
          value={formatMoney(summary.expected, currency, { compact: true })}
          hint={`${formatNumber(summary.total)} invoice(s)`}
          icon={CalendarRange}
          tone="primary"
          loading={isLoading}
        />
        <StatCard
          label="Collected"
          value={formatMoney(summary.collected, currency, { compact: true })}
          hint={`${formatPercent(summary.collectionRate)} of expected`}
          icon={TrendingUp}
          tone="success"
          loading={isLoading}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.outstanding, currency, { compact: true })}
          hint={`${formatNumber((summary.unpaid || 0) + (summary.partial || 0))} invoice(s) not fully paid`}
          icon={Wallet}
          tone={summary.outstanding > 0 ? 'destructive' : 'default'}
          loading={isLoading}
        />
        <StatCard
          label="Paid in full"
          value={formatNumber(summary.paid)}
          hint={summary.overdue ? `${formatNumber(summary.overdue)} overdue` : 'Nothing overdue'}
          icon={ReceiptText}
          tone="info"
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection trend</CardTitle>
          <CardDescription>Collected vs outstanding over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {overviewLoading ? <div className="skeleton h-[260px] rounded-xl" /> : <FeeCollectionChart data={trend.map((row) => ({ ...row, received: row.collected, pending: row.pending }))} height={260} />}
        </CardContent>
      </Card>

      <Card>
        <div className="border-b border-border p-4">
          <Toolbar>
            <div className="relative w-full lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search student, phone or ID…"
                className="pl-9"
                aria-label="Search invoices"
              />
            </div>
            <ToolbarGroup>
              <Select value={period} onValueChange={(value) => { setPeriod(value); setPage(1); updateFilter(value, status); }}>
                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Billing period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => syncMutation.mutate()} loading={syncMutation.isPending}>
                <RefreshCw className="h-3.5 w-3.5" /> Refresh overdue
              </Button>
            </ToolbarGroup>
          </Toolbar>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.value}
                size="xs"
                variant={status === tab.value ? 'default' : 'outline'}
                onClick={() => { setStatus(tab.value); setPage(1); updateFilter(period, tab.value); }}
              >
                {tab.label}
                {meta?.counts?.[tab.value] !== undefined ? (
                  <span className="ml-1 tabular-nums opacity-70">{meta.counts[tab.value]}</span>
                ) : null}
              </Button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={fees}
          loading={isLoading}
          emptyState={
            meta?.counts?.total === 0 && !search && status === 'all' ? (
              <EmptyState
                illustration="fees"
                title={`No invoices for ${periodToLabel(period)}`}
                description="Generate this month’s invoices in one click — every active student with a monthly fee gets one."
                action={<Button onClick={() => setGeneratorOpen(true)}><Plus className="h-4 w-4" /> Generate invoices</Button>}
              />
            ) : (
              <EmptyState
                illustration="search"
                title="No invoices match these filters"
                description="Try another period or clear the status filter."
                action={<Button variant="outline" onClick={() => { setSearch(''); setStatus('all'); }}>Clear filters</Button>}
              />
            )
          }
          mobileCard={(row) => {
            const balance = Math.max(0, row.amount - (row.discount || 0) - row.paidAmount);
            return (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{row.studentName}</p>
                    <p className="text-xs text-muted-foreground">{periodToLabel(row.periodKey)} · Seat {row.seatNumber || '—'}</p>
                  </div>
                  <StatusBadge status={row.displayStatus || row.status} kind="fee" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Payable {formatMoney(row.amount - (row.discount || 0), currency)}</span>
                  <span className={balance > 0 ? 'font-medium text-destructive' : 'text-success'}>
                    {balance > 0 ? `Balance ${formatMoney(balance, currency)}` : 'Fully paid'}
                  </span>
                </div>
                {row.status !== 'paid' ? (
                  <Button size="xs" className="w-full" onClick={() => setPayTarget(row)}>
                    <Banknote className="h-3.5 w-3.5" /> Record payment
                  </Button>
                ) : null}
              </div>
            );
          }}
        />

        {fees.length ? <Pagination meta={meta} entity="invoices" onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} /> : null}
        {isFetching && !isLoading ? <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">Refreshing…</div> : null}
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/14 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Overdue automation</p>
              <p className="text-sm text-muted-foreground">
                “Refresh overdue” marks unpaid invoices past their due date, flags those students as fee-due and notifies you.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/librarian/fees/history">Payment history</Link>
          </Button>
        </CardContent>
      </Card>

      <FeeGeneratorDialog open={generatorOpen} onOpenChange={setGeneratorOpen} period={period} onDone={() => refetch()} />

      <FeePaymentDialog
        fee={payTarget}
        open={Boolean(payTarget)}
        onOpenChange={(open) => { if (!open) setPayTarget(null); }}
        onSuccess={() => refetch()}
      />

      <FeeAdjustDialog
        fee={adjustTarget}
        open={Boolean(adjustTarget)}
        onOpenChange={(open) => { if (!open) setAdjustTarget(null); }}
        onDone={() => refetch()}
      />
    </div>
  );
}

const formatDateShort = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: '2-digit' });
};
