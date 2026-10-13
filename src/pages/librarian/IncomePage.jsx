import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Banknote, Download, Receipt, TrendingUp, Users, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Progress } from '../../components/ui/misc.jsx';
import { IncomeExpenseChart } from '../../components/charts/index.js';
import { feeService, financeService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { PAYMENT_METHODS } from '../../utils/constants.js';
import { currentPeriod, formatMoney, formatNumber, formatPercent, periodOptions, periodToLabel } from '../../utils/format.js';

/**
 * Income view = student fee income (the library’s main revenue) broken down by
 * month, shift and payment method, plus security deposits received.
 */
export default function IncomePage() {
  const currency = useCurrency();
  const periods = useMemo(() => periodOptions(18), []);
  const [period, setPeriod] = useState(currentPeriod());

  const { data, isLoading } = useQuery({
    queryKey: ['fees', 'overview', period],
    queryFn: () => feeService.overview({ period, trendMonths: 12 }),
  });

  const { data: financeData, isLoading: financeLoading } = useQuery({
    queryKey: ['finance', 'overview', period],
    queryFn: () => financeService.overview({ period }),
  });

  const summary = data?.data?.summary || {};
  const trend = data?.data?.trend || [];
  const byShift = data?.data?.byShift || [];
  const byMethod = data?.data?.byMethod || [];
  const finance = financeData?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income"
        description="Where your money comes from: monthly student fees, security deposits and collection efficiency."
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]" aria-label="Period"><SelectValue /></SelectTrigger>
              <SelectContent>
                {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => financeService.exportReport('fees', { period })}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Fee income — ${periodToLabel(period, { short: true })}`}
          value={formatMoney(summary.collected, currency, { compact: true })}
          hint={`of ${formatMoney(summary.expected, currency, { compact: true })} expected`}
          icon={Banknote}
          tone="success"
          loading={isLoading}
        />
        <StatCard
          label="Collection rate"
          value={formatPercent(summary.collectionRate)}
          hint={`${formatNumber(summary.paid)} paid · ${formatNumber((summary.unpaid || 0) + (summary.partial || 0))} open`}
          icon={TrendingUp}
          tone="primary"
          loading={isLoading}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.outstanding, currency, { compact: true })}
          hint="Money still to collect for this month"
          icon={Wallet}
          tone={summary.outstanding > 0 ? 'warning' : 'default'}
          loading={isLoading}
        />
        <StatCard
          label="Deposits received"
          value={formatMoney(finance?.income?.deposits, currency, { compact: true })}
          hint="Security deposits (refundable)" 
          icon={Receipt}
          tone="info"
          loading={financeLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee income trend</CardTitle>
          <CardDescription>Expected vs collected over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="skeleton h-[300px] rounded-xl" /> : <IncomeExpenseChart data={trend.map((row) => ({ ...row, income: row.collected, expense: row.pending }))} height={300} />}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income by shift</CardTitle>
            <CardDescription>Which shift brings the most revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {byShift.length === 0 ? (
              <EmptyState compact illustration="fees" title="No shift data yet" description="Add students with a shift to see this breakdown." />
            ) : (
              <div className="space-y-4">
                {byShift.map((row) => {
                  const share = summary.collected ? Math.round((row.collected / summary.collected) * 100) : 0;
                  return (
                    <div key={row.shift}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{row.shift.replace('_', ' ')}</span>
                        <span className="text-muted-foreground">
                          {formatMoney(row.collected, currency)} · {formatNumber(row.students)} student(s)
                        </span>
                      </div>
                      <Progress value={share} className="mt-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
            <CardDescription>How students pay you</CardDescription>
          </CardHeader>
          <CardContent>
            {byMethod.length === 0 ? (
              <EmptyState compact illustration="fees" title="No payments recorded this month" description="Recorded payments appear here grouped by method." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byMethod.map((row) => (
                    <TableRow key={row.method}>
                      <TableCell className="font-medium">{PAYMENT_METHODS.find((m) => m.value === row.method)?.label || row.method}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(row.count)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.total, currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Students with the largest dues</CardTitle>
            <CardDescription>Follow up with these families first</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/librarian/fees?status=unpaid">Open fees <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {data?.data?.topDebtors?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Unpaid months</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.topDebtors.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell>
                      <Link to={`/librarian/students/${row.studentId}`} className="font-medium hover:text-primary">{row.studentName}</Link>
                      <p className="text-xs text-muted-foreground">{row.studentCode || '—'}</p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(row.months)}</TableCell>
                    <TableCell className="text-right font-medium text-destructive tabular-nums">{formatMoney(row.balance, currency)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{row.phone || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              illustration="fees"
              title="No outstanding dues 🎉"
              description="Every invoice for this month is fully paid."
              action={<Button asChild variant="outline"><Link to="/librarian/fees">Go to fees</Link></Button>}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Other income</p>
              <p className="text-sm text-muted-foreground">
                Security deposits are tracked separately from fee income, because they can be refunded when a student leaves.
              </p>
            </div>
          </div>
          <Badge tone="muted">Deposits {formatMoney(finance?.income?.deposits, currency)}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
