import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, CalendarDays, Save, UserCheck, UserX } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Avatar, AvatarFallback } from '../../components/ui/misc.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { employeeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { formatDate, formatNumber, initials } from '../../utils/format.js';

const STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'leave', label: 'Leave' },
  { value: 'half_day', label: 'Half day' },
  { value: 'holiday', label: 'Holiday' },
];

const today = () => new Date().toISOString().slice(0, 10);

/** Daily attendance register for the whole team, saved in one action. */
export default function AttendancePage() {
  const [date, setDate] = useState(today());
  const [draft, setDraft] = useState({});
  const [times, setTimes] = useState({});

  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employees', 'attendance-roster'],
    queryFn: () => employeeService.list({ status: 'all', limit: 100, sort: 'fullName' }),
  });

  const { data: dayData, isLoading: dayLoading } = useQuery({
    queryKey: ['employees', 'attendance-day', date],
    queryFn: () => employeeService.attendance({ dayKey: date }),
    keepPreviousData: true,
  });

  const employees = useMemo(
    () => (employeeData?.data || []).filter((employee) => ['active', 'on_leave'].includes(employee.status)),
    [employeeData]
  );
  const records = dayData?.data?.records || [];
  const summary = dayData?.data?.summary || {};

  useEffect(() => {
    // Start a new day from scratch; already-saved records are loaded from the API.
    setDraft(Object.fromEntries(records.map((row) => [String(row.employeeId), row.status])));
    setTimes(
      Object.fromEntries(
        records.map((row) => [String(row.employeeId), { checkIn: row.checkIn || '', checkOut: row.checkOut || '' }])
      )
    );
  }, [records]);

  const mutation = useApiMutation({
    mutationFn: (payload) => employeeService.markAttendance(payload),
    invalidate: ['employees', 'dashboard'],
    successMessage: (response) => response?.message || 'Attendance saved',
  });

  const rows = employees.map((employee) => {
    const existing = records.find((row) => String(row.employeeId) === String(employee.id));
    return {
      ...employee,
      status: draft[employee.id] ?? existing?.status ?? 'present',
      checkIn: times[employee.id]?.checkIn ?? existing?.checkIn ?? '',
      checkOut: times[employee.id]?.checkOut ?? existing?.checkOut ?? '',
      saved: Boolean(existing),
    };
  });

  const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  const markAll = (status) => setDraft(Object.fromEntries(employees.map((employee) => [employee.id, status])));

  const save = () =>
    mutation.mutate({
      date,
      records: rows.map((row) => ({
        employeeId: row.id,
        status: row.status,
        checkIn: row.checkIn || null,
        checkOut: row.checkOut || null,
      })),
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark the whole team in one screen. Saved records update the same day instead of creating duplicates."
        actions={
          <>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-[160px]"
              aria-label="Attendance date"
            />
            <Button onClick={save} loading={mutation.isPending} disabled={!rows.length}>
              <Save className="h-4 w-4" /> Save attendance
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Team size" value={formatNumber(rows.length)} hint={formatDate(date, { weekday: 'long', day: '2-digit', month: 'short' })} icon={CalendarDays} tone="primary" loading={isLoading} />
        <StatCard label="Present" value={formatNumber(counts.present)} icon={UserCheck} tone="success" />
        <StatCard label="Absent" value={formatNumber(counts.absent)} icon={UserX} tone={counts.absent ? 'destructive' : 'default'} />
        <StatCard label="Leave / half day" value={formatNumber((counts.leave || 0) + (counts.half_day || 0))} hint={`${formatNumber(counts.holiday)} holiday`} tone="warning" />
      </div>

      {Object.keys(summary).length ? (
        <Alert tone="info" title={`${records.length} record(s) already saved for ${formatDate(date)}`}>
          Change anything below and press “Save attendance” — the existing records for this date are updated.
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Daily register</CardTitle>
            <CardDescription>Pick a status per employee; in/out times are optional.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="xs" variant="outline" onClick={() => markAll('present')} disabled={!rows.length}>All present</Button>
            <Button size="xs" variant="outline" onClick={() => markAll('leave')} disabled={!rows.length}>All leave</Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading || dayLoading ? (
            <LoadingBlock label="Loading team…" />
          ) : rows.length === 0 ? (
            <EmptyState
              illustration="employees"
              title="No active employees"
              description="Add your team first — then you can mark attendance here every day."
              action={<Button asChild><a href="/librarian/employees">Go to employees</a></Button>}
            />
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((row) => (
                <li key={row.id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">{initials(row.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.position}{row.saved ? ' · saved' : ' · not saved yet'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {STATUSES.map((option) => (
                        <Button
                          key={option.value}
                          size="xs"
                          variant={row.status === option.value ? 'default' : 'outline'}
                          aria-pressed={row.status === option.value}
                          onClick={() => setDraft((prev) => ({ ...prev, [row.id]: option.value }))}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="time"
                      value={row.checkIn}
                      onChange={(e) => setTimes((prev) => ({ ...prev, [row.id]: { ...prev[row.id], checkIn: e.target.value } }))}
                      className="h-8 w-[104px] text-xs"
                      aria-label={`Check-in time for ${row.fullName}`}
                    />
                    <Input
                      type="time"
                      value={row.checkOut}
                      onChange={(e) => setTimes((prev) => ({ ...prev, [row.id]: { ...prev[row.id], checkOut: e.target.value } }))}
                      className="h-8 w-[104px] text-xs"
                      aria-label={`Check-out time for ${row.fullName}`}
                    />
                    <StatusBadge status={row.status} kind="attendance" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} loading={mutation.isPending} disabled={!rows.length}>
          <BadgeCheck className="h-4 w-4" /> Save attendance for {formatDate(date, { day: '2-digit', month: 'short' })}
        </Button>
      </div>
    </div>
  );
}
