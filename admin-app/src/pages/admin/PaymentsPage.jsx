import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2, CreditCard, Download, IndianRupee, Landmark, Plus, TrendingUp,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { IncomeExpenseChart } from '../../components/charts/index.js';
import { AdminActionDialog } from '../../components/admin/AdminActionDialog.jsx';
import { adminService, libraryService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { PAYMENT_METHODS } from '../../utils/constants.js';
import { formatDate, formatMoney, formatNumber } from '../../utils/format.js';

/** Platform revenue: subscription payments received from libraries. */
export default function AdminPaymentsPage() {
  const currency = useCurrency();
  const [months, setMonths] = useState(12);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'revenue', { months, page }],
    queryFn: () => adminService.revenue({ months, page, limit: 25 }),
    keepPreviousData: true,
  });

  const { data: libraries } = useQuery({
    queryKey: ['libraries', 'admin', 'payable'],
    queryFn: () => libraryService.adminList({ status: 'all', limit: 200, sortBy: 'name' }),
  });

  const revenue = data?.data || {};
  const payments = revenue.payments || [];
  const meta = data?.meta;
  const series = revenue.series || [];
  const totals = revenue.totals || {};

  const payableLibraries = useMemo(
    () => (libraries?.data || []).filter((library) => !['pending', 'rejected'].includes(library.status)),
    [libraries]
  );

  const exportMutation = useApiMutation({
    mutationFn: () => adminService.exportRevenue(),
    successMessage: 'Export ready',
  });

  const columns = [
    {
      key: 'libraryName',
      label: 'Library',
      render: (row) => (
        <div className="text-sm">
          <Link to={`/admin/libraries/${row.libraryId}`} className="font-medium hover:text-primary">{row.libraryName || '—'}</Link>
          <p className="text-xs text-muted-foreground">{row.invoiceNumber}</p>
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Period covered',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.periodStart ? `${formatDate(row.periodStart)} → ${formatDate(row.periodEnd)}` : `${row.month}/${row.year}`}
        </span>
      ),
    },
    { key: 'paidAt', label: 'Received', render: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.paidAt)}</span> },
    {
      key: 'method',
      label: 'Method',
      render: (row) => <Badge tone="muted">{PAYMENT_METHODS.find((m) => m.value === row.method)?.label || row.method}</Badge>,
    },
    { key: 'purpose', label: 'Purpose', render: (row) => <span className="text-xs capitalize text-muted-foreground">{row.purpose?.replace('_', ' ')}</span> },
    { key: 'recordedByName', label: 'Recorded by', render: (row) => <span className="text-xs text-muted-foreground">{row.recordedByName || '—'}</span> },
    { key: 'amount', label: 'Amount', align: 'right', render: (row) => <span className="font-medium text-success">{formatMoney(row.amount, currency)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform payments"
        description="Every rupee the platform has received from libraries, with the invoice trail."
        actions={
          <>
            <Select value={String(months)} onValueChange={(value) => { setMonths(Number(value)); setPage(1); }}>
              <SelectTrigger className="w-[160px]" aria-label="Range"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
                <SelectItem value="24">Last 24 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => exportMutation.mutate()} loading={exportMutation.isPending}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setAction({ type: 'recordPayment', library: payableLibraries[0] })} disabled={!payableLibraries.length}>
              <Plus className="h-4 w-4" /> Record a payment
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Collected (${months} months)`}
          value={formatMoney(totals.collected, currency, { compact: true })}
          hint={`${formatNumber(totals.paymentCount)} payment(s)`}
          icon={IndianRupee}
          tone="success"
          loading={isLoading}
        />
        <StatCard
          label="This month"
          value={formatMoney(revenue.thisMonth, currency, { compact: true })}
          hint={revenue.lastMonth ? `Last month ${formatMoney(revenue.lastMonth, currency, { compact: true })}` : ''}
          icon={TrendingUp}
          tone="primary"
          loading={isLoading}
        />
        <StatCard
          label="Average payment"
          value={formatMoney(totals.average, currency, { compact: true })}
          hint="Across recorded subscription payments"
          icon={CreditCard}
          tone="info"
          loading={isLoading}
        />
        <StatCard
          label="Paying libraries"
          value={formatNumber(totals.payingLibraries)}
          hint="Libraries with at least one payment"
          icon={Building2}
          tone="success"
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by month</CardTitle>
          <CardDescription>Collected against expected recurring revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="skeleton h-[300px] rounded-xl" />
          ) : (
            <IncomeExpenseChart
              data={series.map((row) => ({ ...row, income: row.amount, expense: row.expected }))}
              height={300}
              showProfit={false}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment records</CardTitle>
          <CardDescription>{isLoading ? 'Loading…' : `${formatNumber(meta?.total ?? payments.length)} record(s)`}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <DataTable
            columns={columns}
            rows={payments}
            loading={isLoading}
            emptyState={
              <EmptyState
                illustration="finance"
                title="No payments recorded yet"
                description="Select a library above and record its first subscription payment — the invoice is generated automatically."
              />
            }
            mobileCard={(row) => (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{row.libraryName}</p>
                  <p className="text-xs text-muted-foreground">{row.invoiceNumber} · {formatDate(row.paidAt)}</p>
                </div>
                <span className="font-medium text-success">{formatMoney(row.amount, currency)}</span>
              </div>
            )}
          />
          {payments.length ? <Pagination meta={meta} entity="payments" onPageChange={setPage} /> : null}
        </CardContent>
      </Card>

      {/* Quick record: pick a library first, then the same action dialog handles the rest */}
      {payableLibraries.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Record a payment for a library</CardTitle>
            <CardDescription>
              Libraries currently on trial or paying — choose one to record its subscription payment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Library</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next payment</TableHead>
                  <TableHead className="text-right">Agreed amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payableLibraries.slice(0, 8).map((library) => (
                  <TableRow key={library.id}>
                    <TableCell>
                      <Link to={`/admin/libraries/${library.id}`} className="font-medium hover:text-primary">{library.name}</Link>
                      <p className="text-xs text-muted-foreground">{library.city}</p>
                    </TableCell>
                    <TableCell><Badge tone="muted">{library.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {library.subscription?.nextPaymentDate ? formatDate(library.subscription.nextPaymentDate) : 'Not scheduled'}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(library.subscription?.amount || 0, currency)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" onClick={() => setAction({ type: 'recordPayment', library })}>Record payment</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <AdminActionDialog action={action} onClose={() => setAction(null)} onDone={() => refetch()} />
    </div>
  );
}
