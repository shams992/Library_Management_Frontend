import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, Download, Scale, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Progress } from '../../components/ui/misc.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { IncomeExpenseChart } from '../../components/charts/index.js';
import { financeService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { EXPENSE_CATEGORIES } from '../../utils/constants.js';
import { currentPeriod, formatMoney, formatNumber, formatPercent, periodOptions, periodToLabel } from '../../utils/format.js';

/** Profit & loss: fee income against salaries + operational expenses. */
export default function ProfitPage() {
  const currency = useCurrency();
  const periods = useMemo(() => periodOptions(24), []);
  const [period, setPeriod] = useState(currentPeriod());

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'overview', period],
    queryFn: () => financeService.overview({ period, trendMonths: 12 }),
  });

  const overview = data?.data;
  const income = overview?.income || {};
  const expenses = overview?.expenses || {};
  const trend = overview?.trend || [];
  const profitable = (overview?.profit ?? 0) >= 0;
  const staffShare = expenses.total ? Math.round((expenses.salaries / expenses.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit &amp; loss"
        description="A clean monthly picture: what came in, what went out, and what is left for you."
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]" aria-label="Period"><SelectValue /></SelectTrigger>
              <SelectContent>
                {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => financeService.exportReport('profit-loss', { period })}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total income" value={formatMoney(income.total, currency, { compact: true })} hint={`Fees ${formatMoney(income.fees, currency, { compact: true })}`} icon={TrendingUp} tone="success" loading={isLoading} />
        <StatCard label="Total expenses" value={formatMoney(expenses.total, currency, { compact: true })} hint={`Salaries ${formatMoney(expenses.salaries, currency, { compact: true })}`} icon={TrendingDown} tone="destructive" loading={isLoading} />
        <StatCard
          label="Net profit"
          value={formatMoney(overview?.profit, currency, { compact: true })}
          hint={overview ? `Margin ${formatPercent(overview.margin)}` : ''}
          icon={Wallet}
          tone={profitable ? 'success' : 'destructive'}
          valueClassName={profitable ? 'text-success' : 'text-destructive'}
          loading={isLoading}
        />
        <StatCard
          label="Outstanding fees"
          value={formatMoney(overview?.outstanding?.total, currency, { compact: true })}
          hint={overview ? `Across ${formatNumber(overview.outstanding?.students)} student(s)` : ''}
          icon={Scale}
          tone="warning"
          loading={isLoading}
        />
      </div>

      {!isLoading && !profitable ? (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col gap-3 p-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
                <ArrowDownRight className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium">Expenses are higher than income this month</p>
                <p className="text-sm text-muted-foreground">
                  The biggest driver is {staffShare >= 40 ? 'staff salaries' : 'operational expenses'}. Review the breakdown below —
                  the data stays available even if you act next month.
                </p>
              </div>
            </div>
            <Badge tone="destructive">Loss {formatMoney(Math.abs(overview?.profit || 0), currency)}</Badge>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Income, expenses and profit</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="skeleton h-[320px] rounded-xl" /> : <IncomeExpenseChart data={trend} height={320} showProfit />}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Statement — {periodToLabel(period)}</CardTitle>
            <CardDescription>Every line is calculated from your recorded transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line item</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2"><ArrowUpRight className="h-3.5 w-3.5 text-success" /> Student fees collected</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-success">{formatMoney(income.fees, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {income.total ? `${Math.round((income.fees / income.total) * 100)}%` : '—'}
                  </TableCell>
                </TableRow>
                {income.deposits ? (
                  <TableRow>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2"><ArrowUpRight className="h-3.5 w-3.5 text-success" /> Security deposits received</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-success">{formatMoney(income.deposits, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {income.total ? `${Math.round((income.deposits / income.total) * 100)}%` : '—'}
                    </TableCell>
                  </TableRow>
                ) : null}

                {(expenses.byCategory || []).map((row) => (
                  <TableRow key={row.category}>
                    <TableCell className="text-muted-foreground">
                      {EXPENSE_CATEGORIES.find((c) => c.value === row.category)?.label || row.category}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-destructive">−{formatMoney(row.total, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {expenses.total ? `${Math.round((row.total / expenses.total) * 100)}%` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Net profit</TableCell>
                  <TableCell className={`text-right font-semibold tabular-nums ${profitable ? 'text-success' : 'text-destructive'}`}>
                    {formatMoney(overview?.profit, currency)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatPercent(overview?.margin)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost structure</CardTitle>
              <CardDescription>How your expenses split up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenses.total ? (
                <>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Staff salaries</span>
                      <span className="font-medium">{formatMoney(expenses.salaries, currency)}</span>
                    </div>
                    <Progress value={staffShare} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Operational costs</span>
                      <span className="font-medium">{formatMoney(expenses.operational, currency)}</span>
                    </div>
                    <Progress value={100 - staffShare} className="mt-2" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keeping staff costs under roughly 40% of fee income is a healthy target for a reading room.
                  </p>
                </>
              ) : (
                <EmptyState compact illustration="finance" title="No expenses recorded yet" description="Once you record bills and salaries, this section shows your cost structure." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Month by month</CardTitle>
              <CardDescription>Profit for the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {trend.length === 0 ? (
                <EmptyState compact illustration="finance" title="Not enough data yet" description="Record some income and expenses to build the trend." />
              ) : (
                <ul className="divide-y divide-border">
                  {trend.slice(-6).reverse().map((row) => (
                    <li key={row.periodKey} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="text-muted-foreground">{row.label || periodToLabel(row.periodKey, { short: true })}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          in {formatMoney(row.income, currency, { compact: true })} / out {formatMoney(row.expense, currency, { compact: true })}
                        </span>
                        <span className={`font-medium tabular-nums ${(row.profit ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatMoney(row.profit, currency, { compact: true })}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
