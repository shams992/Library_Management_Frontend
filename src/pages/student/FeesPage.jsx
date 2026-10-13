import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Banknote, CheckCircle2, Receipt, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { LoadingBlock } from '../../components/ui/feedback.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { PAYMENT_METHODS } from '../../utils/constants.js';
import { portalService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney, formatNumber, periodOptions, periodToLabel } from '../../utils/format.js';

/** "My fees": invoices, payments made and what is still outstanding. */
export default function StudentFeesPage() {
  const currency = useCurrency();
  const periods = useMemo(() => periodOptions(24), []);
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'student', 'fees', { period, status, page }],
    queryFn: () => portalService.studentFees({ period, status, page, limit: 12 }),
    keepPreviousData: true,
  });

  const fees = data?.data || [];
  const totals = data?.meta?.summary || {};
  const payments = data?.meta?.payments || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My fees"
        description="Every invoice your library generated for you, and every payment they recorded."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total billed" value={formatMoney(totals.expected, currency, { compact: true })} hint={`${formatNumber(totals.total)} invoice(s)`} icon={Receipt} tone="primary" loading={isLoading} />
        <StatCard label="Total paid" value={formatMoney(totals.collected, currency, { compact: true })} icon={CheckCircle2} tone="success" loading={isLoading} />
        <StatCard label="Outstanding" value={formatMoney(totals.outstanding, currency, { compact: true })} icon={Wallet} tone={totals.outstanding > 0 ? 'destructive' : 'success'} loading={isLoading} />
        <StatCard label="Paid in full" value={formatNumber(totals.paid)} hint={`${formatNumber(totals.unpaid)} unpaid`} icon={Banknote} tone="info" loading={isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Newest first</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={period} onValueChange={(value) => { setPeriod(value); setPage(1); }}>
                <SelectTrigger className="w-[170px]" aria-label="Period"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
                <SelectTrigger className="w-[150px]" aria-label="Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <LoadingBlock label="Loading your fees…" />
            ) : fees.length === 0 ? (
              <EmptyState
                illustration="fees"
                title="No invoices for this filter"
                description="Change the month or status filter to see other records. Your library keeps every invoice."
                action={<Button variant="outline" onClick={() => { setPeriod('all'); setStatus('all'); }}>Show everything</Button>}
              />
            ) : (
              <ul className="divide-y divide-border">
                {fees.map((fee) => {
                  const payable = fee.amount - (fee.discount || 0);
                  const balance = Math.max(0, payable - fee.paidAmount);
                  return (
                    <li key={fee.id} className="py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{periodToLabel(fee.periodKey)}</p>
                          <p className="text-xs text-muted-foreground">
                            Due {fee.dueDate ? formatDate(fee.dueDate) : 'on the 10th'}
                            {fee.discount ? ` · discount ${formatMoney(fee.discount, currency)}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Payable </span>
                            <span className="font-medium">{formatMoney(payable, currency)}</span>
                          </p>
                          <p className={`text-xs ${balance > 0 ? 'text-destructive' : 'text-success'}`}>
                            {balance > 0 ? `Balance ${formatMoney(balance, currency)}` : 'Fully paid'}
                          </p>
                        </div>
                        <StatusBadge status={fee.status} kind="fee" />
                      </div>

                      {fee.payments?.length ? (
                        <ul className="mt-2.5 space-y-1.5 rounded-lg bg-muted/50 p-3">
                          {fee.payments.map((payment) => (
                            <li key={payment.id || `${payment.paidAt}-${payment.amount}`} className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {formatDate(payment.paidAt)} · {PAYMENT_METHODS.find((m) => m.value === payment.method)?.label || 'Cash'}
                                {payment.reference ? ` · ${payment.reference}` : ''}
                              </span>
                              <span className="font-medium text-success">{formatMoney(payment.amount, currency)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {balance > 0 ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Please pay at the library counter or by bank transfer — your librarian will record it here immediately.
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}

            {fees.length ? <Pagination meta={data?.meta} entity="invoices" onPageChange={setPage} /> : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment history</CardTitle>
              <CardDescription>Payments your library recorded</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <EmptyState compact illustration="fees" title="No payments recorded yet" description="Payments appear here as soon as the library records them." />
              ) : (
                <ul className="divide-y divide-border">
                  {payments.map((payment) => (
                    <li key={payment.id || `${payment.paidAt}-${payment.amount}`} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <p className="font-medium">{formatMoney(payment.amount, currency)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.paidAt)} · {periodToLabel(payment.periodKey, { short: true })}
                        </p>
                      </div>
                      <Badge tone="success">{PAYMENT_METHODS.find((m) => m.value === payment.method)?.label || 'Cash'}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium">Understanding your fee record</p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li>• An invoice is generated each month by your library.</li>
                <li>• Partial payments are allowed — the balance stays visible here.</li>
                <li>• Discounts (sibling, scholarship) appear on the invoice line.</li>
                <li>• Money never moves through this portal; it is a record only.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
