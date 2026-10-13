import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Activity, Building2, Download, IndianRupee, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { IncomeExpenseChart, PlatformGrowthChart } from '../../components/charts/index.js';
import { adminService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDateTime, formatMoney, formatNumber } from '../../utils/format.js';

/** Platform reports: revenue, growth, library performance and the audit log. */
export default function AdminReportsPage() {
  const currency = useCurrency();
  const [months, setMonths] = useState(12);
  const [auditPage, setAuditPage] = useState(1);

  const { data: revenue, isLoading } = useQuery({
    queryKey: ['admin', 'revenue', { months, page: auditPage }],
    queryFn: () => adminService.revenue({ months, page: auditPage, limit: 25 }),
    keepPreviousData: true,
  });

  const { data: audit, isLoading: auditLoading } = useQuery({
    queryKey: ['admin', 'audit', { page: auditPage }],
    queryFn: () => adminService.auditLogs({ page: auditPage, limit: 25 }),
    keepPreviousData: true,
  });

  const report = revenue?.data || {};
  const series = report.series || [];
  const growth = report.growth || [];
  const topLibraries = report.topLibraries || [];
  const logs = audit?.data || [];
  const auditMeta = audit?.meta;

  const exportMutation = useApiMutation({
    mutationFn: () => adminService.exportRevenue(),
    successMessage: 'Platform revenue export ready',
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform reports"
        description="Growth, revenue and every administrative action, exportable for your records."
        actions={
          <>
            <Select value={String(months)} onValueChange={(value) => setMonths(Number(value))}>
              <SelectTrigger className="w-[160px]" aria-label="Range"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
                <SelectItem value="24">Last 24 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => exportMutation.mutate()} loading={exportMutation.isPending}>
              <Download className="h-4 w-4" /> Export revenue CSV
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (range)" value={formatMoney(report.totals?.collected, currency, { compact: true })} icon={IndianRupee} tone="success" loading={isLoading} />
        <StatCard label="MRR" value={formatMoney(report.mrr, currency, { compact: true })} hint="From currently active libraries" icon={TrendingUp} tone="primary" loading={isLoading} />
        <StatCard label="Libraries" value={formatNumber(report.libraryCount)} icon={Building2} tone="info" loading={isLoading} />
        <StatCard label="Students" value={formatNumber(report.studentCount)} icon={Users} tone="primary" loading={isLoading} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Collected vs expected subscription revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="skeleton h-[300px] rounded-xl" />
            ) : (
              <IncomeExpenseChart data={series.map((row) => ({ ...row, income: row.amount, expense: row.expected }))} height={300} showProfit={false} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth</CardTitle>
            <CardDescription>New libraries and students per month</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="skeleton h-[300px] rounded-xl" />
            ) : (
              <PlatformGrowthChart
                data={growth}
                keys={[
                  { key: 'libraries', label: 'New libraries', colour: 'hsl(var(--primary))' },
                  { key: 'students', label: 'New students', colour: 'hsl(var(--accent))' },
                ]}
                height={300}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top libraries</CardTitle>
          <CardDescription>Ranked by students on board and subscription revenue</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}</div>
          ) : topLibraries.length === 0 ? (
            <EmptyState compact illustration="libraries" title="No library activity yet" description="Libraries appear here once they start adding students." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Library</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Seats used</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLibraries.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link to={`/admin/libraries/${row.id}`} className="font-medium hover:text-primary">{row.name}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.city}</TableCell>
                    <TableCell><Badge tone="muted">{row.status?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(row.stats?.totalStudents || 0)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(row.stats?.occupiedSeats || 0)}/{formatNumber(row.stats?.totalSeats || 0)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-success">{formatMoney(row.totalPaid || 0, currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Audit log</CardTitle>
            <CardDescription>Accountability for every administrative action</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button size="xs" variant="outline" disabled={auditPage <= 1} onClick={() => setAuditPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Badge tone="muted">Page {auditMeta?.page || auditPage}</Badge>
            <Button size="xs" variant="outline" disabled={(auditMeta?.pages || 1) <= auditPage} onClick={() => setAuditPage((p) => p + 1)}>Next</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {auditLoading ? (
            <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}</div>
          ) : logs.length === 0 ? (
            <EmptyState compact illustration="reports" title="No audit entries yet" description="Approvals, suspensions and setting changes will be listed here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Library</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium capitalize">{entry.action?.replace(/[._]/g, ' ')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.actorName || 'System'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.libraryName || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
