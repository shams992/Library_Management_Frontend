import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, CalendarClock, Plus, Search, UserRound, Wallet, Pencil, Archive } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Toolbar, ToolbarGroup } from '../../components/common/Toolbar.jsx';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { ConfirmDialog } from '../../components/ui/confirm-dialog.jsx';
import { LoadingBlock } from '../../components/ui/feedback.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/misc.jsx';
import { EmployeeFormDialog } from '../../components/employees/EmployeeFormDialog.jsx';
import { employeeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useQueryParams } from '../../hooks/useQueryParams.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney, initials } from '../../utils/format.js';

const STATUS_TABS = [
  { value: 'all', label: 'Everyone' },
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On leave' },
  { value: 'resigned', label: 'Left' },
];

/** Staff register: who works here, what they do and what they are paid. */
export default function EmployeesPage() {
  const currency = useCurrency();
  const { params, setParams } = useQueryParams({ page: '1', limit: '10', status: 'all', search: '' });
  const [search, setSearch] = useState(params.search || '');
  const debouncedSearch = useDebounce(search, 350);
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);

  const query = useMemo(
    () => ({ page: params.page, limit: params.limit, status: params.status, search: debouncedSearch || undefined }),
    [params.page, params.limit, params.status, debouncedSearch]
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['employees', 'list', query],
    queryFn: () => employeeService.list(query),
    keepPreviousData: true,
  });

  const employees = data?.data || [];
  const meta = data?.meta;
  const counts = meta?.counts;

  const archiveMutation = useApiMutation({
    mutationFn: (id) => employeeService.archive(id, { status: 'resigned', reason: 'Archived from the staff register' }),
    invalidate: ['employees', 'dashboard'],
    successMessage: 'Employee archived — history kept',
    onSuccess: () => setArchiveTarget(null),
  });

  const columns = [
    {
      key: 'fullName',
      label: 'Staff member',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {row.photo ? <AvatarImage src={row.photo} alt={row.fullName} /> : null}
            <AvatarFallback>{initials(row.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.employeeCode || '—'}{row.phone ? ` · ${row.phone}` : ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      label: 'Position',
      render: (row) => (
        <div>
          <p className="text-sm">{row.position || '—'}</p>
          {row.department ? <p className="text-xs text-muted-foreground">{row.department}</p> : null}
        </div>
      ),
    },
    { key: 'joiningDate', label: 'Joined', render: (row) => <span className="text-sm">{row.joiningDate ? formatDate(row.joiningDate) : '—'}</span> },
    {
      key: 'salary',
      label: 'Salary',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <p className="text-sm font-medium tabular-nums">{formatMoney(row.salary || 0, currency)}</p>
          <p className="text-xs capitalize text-muted-foreground">{row.salaryType || 'monthly'}</p>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} kind="employee" /> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button asChild size="xs" variant="outline">
            <Link to={`/librarian/employees/${row.id}`}><UserRound className="h-3.5 w-3.5" /> Open</Link>
          </Button>
          <Button size="xs" variant="ghost" onClick={() => { setEditEmployee(row); setFormOpen(true); }} aria-label={`Edit ${row.fullName}`}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {row.status !== 'resigned' && row.status !== 'terminated' ? (
            <Button size="xs" variant="ghost" onClick={() => setArchiveTarget(row)} aria-label={`Archive ${row.fullName}`}>
              <Archive className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Your team, their roles and their salaries."
        actions={
          <Button onClick={() => { setEditEmployee(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Add employee
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total staff" value={counts?.total ?? 0} icon={Briefcase} loading={isLoading} />
        <StatCard label="Active" value={counts?.active ?? 0} icon={UserRound} tone="success" loading={isLoading} />
        <StatCard label="On leave" value={counts?.onLeave ?? 0} icon={CalendarClock} tone="warning" loading={isLoading} />
        <StatCard label="Ex-staff" value={counts?.resigned ?? 0} icon={Archive} tone="muted" loading={isLoading} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <Toolbar>
            <ToolbarGroup className="flex-1">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setParams({ page: '1', search: event.target.value }); }}
                  placeholder="Search name, role, phone or ID"
                  aria-label="Search employees"
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {STATUS_TABS.map((tab) => (
                  <Button
                    key={tab.value}
                    size="xs"
                    variant={params.status === tab.value ? 'default' : 'outline'}
                    onClick={() => setParams({ status: tab.value, page: '1' })}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </ToolbarGroup>
            <Button asChild variant="outline" size="sm">
              <Link to="/librarian/employees/salaries"><Wallet className="h-3.5 w-3.5" /> Salary sheets</Link>
            </Button>
          </Toolbar>

          {isLoading ? (
            <LoadingBlock label="Loading your team…" />
          ) : isError ? (
            <EmptyState illustration="search" title="Could not load employees" description={error?.message || 'Please try again.'} action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>} />
          ) : employees.length === 0 ? (
            <EmptyState
              illustration="employees"
              title={debouncedSearch || params.status !== 'all' ? 'No staff match these filters' : 'No employees yet'}
              description={
                debouncedSearch || params.status !== 'all'
                  ? 'Try another status or clear the search.'
                  : 'Add the people who run your library — receptionists, cleaners, IT staff. Their salaries and attendance will be tracked here.'
              }
              action={<Button onClick={() => { setEditEmployee(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add employee</Button>}
            />
          ) : (
            <>
              <DataTable
                columns={columns}
                rows={employees}
                loading={isFetching && !isLoading}
                emptyState={<EmptyState illustration="employees" title="No employees found" description="Adjust your filters to see more of your team." />}
                mobileCard={(row) => (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {row.photo ? <AvatarImage src={row.photo} alt={row.fullName} /> : null}
                        <AvatarFallback>{initials(row.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{row.fullName}</p>
                        <p className="text-xs text-muted-foreground">{row.position} · {formatMoney(row.salary || 0, currency)}</p>
                      </div>
                    </div>
                    <StatusBadge status={row.status} kind="employee" />
                  </div>
                )}
              />
              <Pagination meta={meta} entity="employees" onPageChange={(page) => setParams({ page })} onLimitChange={(limit) => setParams({ limit, page: '1' })} />
            </>
          )}
        </CardContent>
      </Card>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditEmployee(null); }}
        employee={editEmployee}
        onDone={() => refetch()}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => { if (!open) setArchiveTarget(null); }}
        title={`Archive ${archiveTarget?.fullName || 'this employee'}?`}
        description="They will stop appearing in payroll sheets, but their salary and attendance history stays in your records."
        confirmLabel="Archive employee"
        loading={archiveMutation.isPending}
        onConfirm={() => archiveMutation.mutate(archiveTarget.id)}
      />
    </div>
  );
}
