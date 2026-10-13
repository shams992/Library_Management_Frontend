import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Search, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { feeService } from '../../services/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { PAYMENT_METHODS } from '../../utils/constants.js';
import { currentPeriod, formatDateTime, formatMoney, formatNumber, periodOptions, periodToLabel } from '../../utils/format.js';

/**
 * Payment history: every rupee recorded, with method + reference.
 * Backed by GET /api/fees/summary, which returns the recorded payments for the
 * selected period together with the collection totals.
 */
export default function FeeHistoryPage() {
  const currency = useCurrency();
  const periods = useMemo(() => periodOptions(18), []);
  const [period, setPeriod] = useState(currentPeriod());
  const [method, setMethod] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['fees', 'payments', { period, method, search: debouncedSearch, page }],
    queryFn: () => feeService.summary({ period, method, search: debouncedSearch, page, limit: 25, includePayments: 'true' }),
    keepPreviousData: true,
  });

  const payments = data?.data?.payments || [];
  const meta = data?.meta;
  const totals = data?.data?.totals || {};

  const filtered = useMemo(
    () =>
      payments.filter((payment) => {
        const matchesMethod = method === 'all' || payment.method === method;
        const term = debouncedSearch.trim().toLowerCase();
        const matchesSearch =
          !term ||
          String(payment.studentName || '').toLowerCase().includes(term) ||
          String(payment.reference || '').toLowerCase().includes(term) ||
          String(payment.studentCode || '').toLowerCase().includes(term);
        return matchesMethod && matchesSearch;
      }),
    [payments, method, debouncedSearch]
  );

  const columns = [
    {
      key: 'studentName',
      label: 'Student',
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium">{row.studentName}</p>
          <p className="text-xs text-muted-foreground">{row.studentCode || '—'}{row.seatNumber ? ` · Seat ${row.seatNumber}` : ''}</p>
        </div>
      ),
    },
    { key: 'periodKey', label: 'For month', render: (row) => <span className="text-sm">{periodToLabel(row.periodKey)}</span> },
    { key: 'paidAt', label: 'Received', render: (row) => <span className="text-xs text-muted-foreground">{formatDateTime(row.paidAt)}</span> },
    { key: 'method', label: 'Method', render: (row) => <Badge tone="muted">{PAYMENT_METHODS.find((m) => m.value === row.method)?.label || row.method || 'Cash'}</Badge> },
    { key: 'reference', label: 'Reference', render: (row) => <span className="text-xs text-muted-foreground">{row.reference || '—'}</span> },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <span className="font-medium text-success">{formatMoney(row.amount, currency)}</span>,
    },
    { key: 'recordedBy', label: 'Recorded by', render: (row) => <span className="text-xs text-muted-foreground">{row.recordedBy || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment history"
        description="Every payment recorded against a student invoice, with the method used and who recorded it."
        actions={
          <Button variant="outline" onClick={() => feeService.exportCsv()}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected this month" value={formatMoney(totals.collected, currency, { compact: true })} icon={Wallet} tone="success" loading={isLoading} />
        <StatCard label="Payments recorded" value={formatNumber(totals.paymentCount)} tone="primary" loading={isLoading} />
        <StatCard label="Average payment" value={formatMoney(totals.average, currency, { compact: true })} tone="info" loading={isLoading} />
        <StatCard label="Outstanding" value={formatMoney(totals.outstanding, currency, { compact: true })} tone={totals.outstanding > 0 ? 'destructive' : 'default'} loading={isLoading} />
      </div>

      <Card>
        <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Payments</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading…' : `${formatNumber(meta?.total ?? filtered.length)} payment(s) found`}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Student or reference…"
                className="w-full pl-9 sm:w-56"
                aria-label="Search payments"
              />
            </div>
            <Select value={period} onValueChange={(value) => { setPeriod(value); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[170px]" aria-label="Period"><SelectValue /></SelectTrigger>
              <SelectContent>
                {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full sm:w-[160px]" aria-label="Payment method"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                {PAYMENT_METHODS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Method breakdown — proportions come from the API, not from guesses */}
          {data?.data?.byMethod?.length ? (
            <div className="rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Total collected</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.byMethod.map((row) => (
                    <TableRow key={row.method}>
                      <TableCell className="font-medium">{PAYMENT_METHODS.find((m) => m.value === row.method)?.label || row.method}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(row.count)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.total, currency)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {totals.collected ? `${Math.round((row.total / totals.collected) * 100)}%` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <DataTable
            columns={columns}
            rows={filtered}
            loading={isLoading}
            emptyState={
              <EmptyState
                illustration="fees"
                title={method !== 'all' || search ? 'No payments match these filters' : `No payments recorded for ${periodToLabel(period)}`}
                description="Record a payment from the Fees page and it will appear here instantly."
                action={<Button asChild variant="outline"><a href="/librarian/fees">Go to fees</a></Button>}
              />
            }
            mobileCard={(row) => (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{row.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {periodToLabel(row.periodKey)} · {PAYMENT_METHODS.find((m) => m.value === row.method)?.label || 'Cash'}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(row.paidAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-success">{formatMoney(row.amount, currency)}</p>
                  <StatusBadge status="paid" kind="fee" label="Received" />
                </div>
              </div>
            )}
          />

          {filtered.length ? <Pagination meta={meta} entity="payments" onPageChange={setPage} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
