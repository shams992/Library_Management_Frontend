import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, CalendarDays, Clock, UserCheck, UserX } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { LoadingBlock } from '../../components/ui/feedback.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { portalService } from '../../services/index.js';
import { formatDate, formatNumber, periodOptions, periodToLabel } from '../../utils/format.js';

/** "My attendance": month view of present/absent/leave days and recorded times. */
export default function EmployeeAttendancePage() {
  const periods = useMemo(() => periodOptions(12), []);
  const [period, setPeriod] = useState(periods[0]?.value);

  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'employee', 'attendance', period],
    queryFn: () => portalService.employeeAttendance({ period }),
    keepPreviousData: true,
  });

  const records = data?.data?.records || [];
  const summary = data?.data?.summary || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="My attendance"
        description="Days marked by your library, with in and out times where recorded."
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]" aria-label="Month"><SelectValue /></SelectTrigger>
            <SelectContent>
              {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Days marked" value={formatNumber(summary.total)} hint={periodToLabel(period)} icon={CalendarDays} tone="primary" loading={isLoading} />
        <StatCard label="Present" value={formatNumber(summary.present)} icon={UserCheck} tone="success" loading={isLoading} />
        <StatCard label="Absent" value={formatNumber(summary.absent)} icon={UserX} tone={summary.absent ? 'destructive' : 'default'} loading={isLoading} />
        <StatCard label="Leave / half day" value={formatNumber((summary.leave || 0) + (summary.half_day || 0))} icon={Clock} tone="warning" loading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily record — {periodToLabel(period)}</CardTitle>
          <CardDescription>Attendance is marked by your library each working day</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingBlock label="Loading attendance…" />
          ) : records.length === 0 ? (
            <EmptyState
              illustration="employees"
              title="No attendance for this month"
              description="Pick another month, or ask your librarian if you think a day is missing."
            />
          ) : (
            <ul className="divide-y divide-border">
              {records.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{formatDate(row.date, { weekday: 'long', day: '2-digit', month: 'short' })}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.checkIn || row.checkOut ? `${row.checkIn || '—'} → ${row.checkOut || '—'}` : 'No times recorded'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.note ? <Badge tone="muted">{row.note}</Badge> : null}
                    <StatusBadge status={row.status} kind="attendance" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <CalendarCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            If a day looks incorrect, raise it with your librarian before the salary for that month is generated — they can
            correct the record.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
