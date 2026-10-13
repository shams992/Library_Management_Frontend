import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, Download, FileSpreadsheet, LayoutGrid, ReceiptText, RefreshCw, Users, Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { financeService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { currentPeriod, formatMoney, formatNumber, periodOptions, periodToLabel } from '../../utils/format.js';

const ICONS = { users: Users, receipt: ReceiptText, wallet: Wallet, grid: LayoutGrid, chart: BarChart3 };

/**
 * Report centre. The API returns the report catalogue and, for each report, the
 * columns + rows + totals, so every report is real data — never a stub.
 */
export default function ReportsPage() {
  const currency = useCurrency();
  const [type, setType] = useState('');
  const [period, setPeriod] = useState(currentPeriod());
  const periods = useMemo(() => periodOptions(24), []);

  const { data: catalog, isLoading: catalogLoading } = useQuery({
    queryKey: ['finance', 'reports'],
    queryFn: () => financeService.catalog(),
  });

  const reports = catalog?.data?.reports || [];

  useEffect(() => {
    if (!type && reports.length) setType(reports[0].type);
  }, [reports, type]);

  const {
    data, isLoading, isFetching, isError, error, refetch,
  } = useQuery({
    queryKey: ['finance', 'report', type, period],
    queryFn: () => financeService.report(type, { period }),
    enabled: Boolean(type),
  });

  const report = data?.data?.report;
  const activeMeta = reports.find((row) => row.type === type);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Print-ready summaries of students, fees, salaries, expenses and profit — all exportable as CSV."
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]" aria-label="Period"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()} loading={isFetching && !isLoading}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              onClick={() => financeService.exportReport(type, { period })}
              disabled={!type}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Available reports</CardTitle>
            <CardDescription>Pick a report to see live numbers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {catalogLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-11 rounded-lg" />)}
              </div>
            ) : reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports available.</p>
            ) : (
              reports.map((row) => {
                const Icon = ICONS[row.icon] || FileSpreadsheet;
                const active = row.type === type;
                return (
                  <button
                    key={row.type}
                    type="button"
                    onClick={() => setType(row.type)}
                    aria-current={active ? 'true' : undefined}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      active ? 'border-primary/40 bg-primary-soft' : 'border-transparent hover:border-border hover:bg-muted/60'
                    }`}
                  >
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{row.title}</span>
                      <span className="block text-xs text-muted-foreground">{row.description}</span>
                    </span>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isError ? (
            <Alert tone="destructive" title="Could not build this report">{error?.message}</Alert>
          ) : isLoading ? (
            <Card><CardContent className="pt-6"><LoadingBlock label="Building report…" /></CardContent></Card>
          ) : !report ? (
            <Card>
              <CardContent className="pt-6">
                <EmptyState illustration="reports" title="Choose a report" description="Select a report on the left to see its live data here." />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>{report.title}</CardTitle>
                      <CardDescription>
                        {report.description}
                        {report.periodLabel ? ` · ${report.periodLabel}` : ''}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="muted">{formatNumber(report.rows?.length || 0)} row(s)</Badge>
                      {report.generatedAt ? (
                        <Badge tone="info">Generated {new Date(report.generatedAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</Badge>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Headline figures for the selected report */}
                  {report.summary?.length ? (
                    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {report.summary.map((item) => (
                        <div key={item.label} className="rounded-xl border border-border bg-muted/40 p-3.5">
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                          <dd className={`mt-1 text-lg font-semibold tabular-nums ${item.tone === 'success' ? 'text-success' : item.tone === 'destructive' ? 'text-destructive' : ''}`}>
                            {item.format === 'money' ? formatMoney(item.value, currency, { compact: true }) : formatNumber(item.value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {report.rows?.length ? (
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {report.columns.map((column) => (
                              <TableHead
                                key={column.key}
                                className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                              >
                                {column.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.rows.map((row, index) => (
                            <TableRow key={row.id || index}>
                              {report.columns.map((column) => {
                                const value = row[column.key];
                                return (
                                  <TableCell
                                    key={column.key}
                                    className={column.align === 'right' ? 'text-right tabular-nums' : column.align === 'center' ? 'text-center' : ''}
                                  >
                                    {column.format === 'money'
                                      ? formatMoney(value, currency)
                                      : column.format === 'percent'
                                        ? `${value ?? 0}%`
                                        : column.format === 'date' && value
                                          ? new Date(value).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
                                          : column.format === 'number'
                                            ? formatNumber(value)
                                            : value ?? '—'}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                        {report.totals ? (
                          <TableFooter>
                            <TableRow>
                              {report.columns.map((column, index) => (
                                <TableCell
                                  key={column.key}
                                  className={`font-semibold ${column.align === 'right' ? 'text-right tabular-nums' : ''}`}
                                >
                                  {index === 0 ? 'Total' : report.totals[column.key] !== undefined
                                    ? column.format === 'money'
                                      ? formatMoney(report.totals[column.key], currency)
                                      : formatNumber(report.totals[column.key])
                                    : ''}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableFooter>
                        ) : null}
                      </Table>
                    </div>
                  ) : (
                    <EmptyState
                      illustration="reports"
                      title="Nothing to report yet"
                      description={`There is no data for this report${period !== 'all' ? ` in ${periodToLabel(period)}` : ''}. Try a different period or record some activity first.`}
                      action={period !== 'all' ? <Button variant="outline" onClick={() => setPeriod('all')}>Show all time</Button> : null}
                    />
                  )}

                  {report.notes?.length ? (
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {report.notes.map((note) => <li key={note}>• {note}</li>)}
                    </ul>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">
                      {activeMeta?.description || 'Export this report to open it in Excel or Google Sheets.'}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => financeService.exportReport(type, { period })}>
                      <FileSpreadsheet className="h-4 w-4" /> Download {report.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
