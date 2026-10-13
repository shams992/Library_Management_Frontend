import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Banknote, CheckCircle2, Download, Filter, LayoutGrid, MoreHorizontal, Pencil, Plus, Search,
  Trash2, UserMinus, UserPlus, Users, XCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Toolbar, ToolbarGroup } from '../../components/common/Toolbar.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Avatar, AvatarFallback } from '../../components/ui/misc.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';
import { studentService, financeService, feeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney, formatNumber, initials, periodToLabel, currentPeriod } from '../../utils/format.js';
import { StudentFormDialog } from '../../components/students/StudentFormDialog.jsx';

export default function StudentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currency = useCurrency();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const status = searchParams.get('status') || 'all';
  const [period, setPeriod] = useState(currentPeriod());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [formOpen, setFormOpen] = useState(searchParams.get('new') === '1');
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    if (searchParams.get('new') === '1') setFormOpen(true);
  }, [searchParams]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['students', { search: debouncedSearch, status, period, page, limit }],
    queryFn: () => studentService.list({ search: debouncedSearch, status, period, page, limit }),
    keepPreviousData: true,
  });

  const students = data?.data || [];
  const meta = data?.meta;
  const counts = meta?.counts || {};

  const leaveMutation = useApiMutation({
    mutationFn: ({ id, reason }) => studentService.leave(id, { reason }),
    invalidate: ['students', 'dashboard', 'seats', 'library', 'fees'],
    successMessage: 'Student marked as left — seat released, history kept',
    onSuccess: () => setSearchParams(new URLSearchParams()),
  });

  const reactivateMutation = useApiMutation({
    mutationFn: (id) => studentService.reactivate(id),
    invalidate: ['students', 'dashboard', 'library'],
    successMessage: 'Student reactivated',
  });

  const setStatus = (next) => {
    const params = new URLSearchParams(searchParams);
    params.delete('new');
    if (next !== 'all') params.set('status', next);
    else params.delete('status');
    setSearchParams(params, { replace: true });
    setPage(1);
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs">{initials(row.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link to={`/librarian/students/${row.id}`} className="truncate font-medium hover:text-primary">{row.fullName}</Link>
            <p className="text-xs text-muted-foreground">
              {row.studentCode || '—'}{row.fatherName ? ` · s/o ${row.fatherName}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (row) => (
        <div className="text-sm">
          <p>{row.phone}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email || row.guardianPhone || '—'}</p>
        </div>
      ),
    },
    {
      key: 'seat',
      label: 'Seat',
      render: (row) => (row.seatNumber ? <Badge tone="info">{row.seatNumber}</Badge> : <span className="text-xs text-muted-foreground">Unassigned</span>),
    },
    { key: 'shift', label: 'Shift', render: (row) => <span className="text-sm capitalize text-muted-foreground">{row.shift?.replace('_', ' ') || '—'}</span> },
    { key: 'monthlyFee', label: 'Fee', align: 'right', render: (row) => <span className="text-sm font-medium">{formatMoney(row.monthlyFee, currency)}</span> },
    {
      key: 'currentFee',
      label: 'This month',
      render: (row) =>
        row.currentFee ? (
          <div className="space-y-1">
            <StatusBadge status={row.currentFee.status} kind="fee" />
            {row.currentFee.status !== 'paid' ? (
              <p className="text-xs text-muted-foreground">
                {formatMoney(Math.max(0, row.currentFee.amount - (row.currentFee.discount || 0) - row.currentFee.paidAmount), currency)} due
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No invoice</span>
        ),
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} kind="student" /> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.fullName}`} onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/librarian/students/${row.id}`)}>Open profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditTarget(row); setFormOpen(true); }}>
              <Pencil className="h-3.5 w-3.5" /> Edit details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/librarian/fees?studentId=${row.id}`)}>
              <Banknote className="h-3.5 w-3.5" /> Fee records
            </DropdownMenuItem>
            {row.status === 'pending' ? (
              <DropdownMenuItem onClick={() => navigate(`/librarian/students/${row.id}?approve=1`)}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve application
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            {row.status === 'left' ? (
              <DropdownMenuItem onClick={() => reactivateMutation.mutate(row.id)}>
                <UserPlus className="h-3.5 w-3.5" /> Mark as active again
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  const reason = window.prompt(`Why is ${row.fullName} leaving?`);
                  if (reason && reason.trim().length >= 3) leaveMutation.mutate({ id: row.id, reason: reason.trim() });
                }}
              >
                <UserMinus className="h-3.5 w-3.5" /> Mark as left
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Search by name, phone, CNIC, email or student ID. Filter by month to see who has paid."
        actions={
          <>
            <Button variant="outline" onClick={() => financeService.exportReport('students')} className="hidden sm:inline-flex">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
              <UserPlus className="h-4 w-4" /> Add student
            </Button>
          </>
        }
      />

      {counts.pending ? (
        <Alert
          tone="warning"
          title={`${counts.pending} application(s) waiting for approval`}
          action={
            <Button size="sm" variant="outline" onClick={() => setStatus('pending')}>
              Review applications
            </Button>
          }
        >
          Approve an application to assign a seat and open the first invoice.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={formatNumber(counts.total)} icon={Users} tone="primary" loading={isLoading} />
        <StatCard label="Active" value={formatNumber(counts.active)} hint={`${formatNumber(counts.left)} have left`} icon={CheckCircle2} tone="success" loading={isLoading} />
        <StatCard label="Pending applications" value={formatNumber(counts.pending)} icon={XCircle} tone="warning" loading={isLoading} />
        <StatCard label="Fee due" value={formatNumber(counts.feeDue)} hint={`Marked in ${periodToLabel(meta?.feePeriod || currentPeriod(), { short: true })}`} icon={Banknote} tone={counts.feeDue ? 'destructive' : 'default'} loading={isLoading} />
      </div>

      <Card>
        <div className="border-b border-border p-4">
          <Toolbar>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Name, phone, CNIC, email or student ID…"
                className="pl-9"
                aria-label="Search students"
              />
            </div>
            <ToolbarGroup>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by status">
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending applications</SelectItem>
                  <SelectItem value="fee_due">Fee due</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                </SelectContent>
              </Select>
              {(search || status !== 'all') ? (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus('all'); }}>Clear</Button>
              ) : null}
            </ToolbarGroup>
          </Toolbar>
        </div>

        <DataTable
          columns={columns}
          rows={students}
          loading={isLoading}
          onRowClick={(row) => navigate(`/librarian/students/${row.id}`)}
          emptyState={
            search || status !== 'all' ? (
              <EmptyState
                illustration="search"
                title="No students match these filters"
                description="Try another search term, or clear the filters to see everyone."
                action={<Button variant="outline" onClick={() => { setSearch(''); setStatus('all'); }}>Clear filters</Button>}
              />
            ) : (
              <EmptyState
                illustration="students"
                title="No students yet"
                description="Add your first student, assign a seat and open the first invoice — it takes under a minute."
                action={<Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add your first student</Button>}
              />
            )
          }
          mobileCard={(row) => (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">{initials(row.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{row.fullName}</p>
                    <p className="text-xs text-muted-foreground">{row.studentCode} · {row.phone}</p>
                  </div>
                </div>
                <StatusBadge status={row.status} kind="student" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{row.seatNumber ? `Seat ${row.seatNumber}` : 'No seat'} · {formatMoney(row.monthlyFee, currency)}/mo</span>
                {row.currentFee ? <StatusBadge status={row.currentFee.status} kind="fee" /> : null}
              </div>
            </div>
          )}
        />

        {students.length ? (
          <Pagination meta={meta} entity="students" onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
        ) : null}
        {isFetching && !isLoading ? <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">Refreshing…</div> : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <CardContent className="flex flex-col gap-3 p-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Monthly fee collection</p>
              <p className="text-sm text-muted-foreground">
                Generate invoices for every active student, then record payments as they come in.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm"><Link to="/librarian/fees">Open fees <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/librarian/seats"><LayoutGrid className="h-3.5 w-3.5" /> Seat map</Link></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>About the selected month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={period} onValueChange={(value) => { setPeriod(value); setPage(1); }}>
              <SelectTrigger aria-label="Fee period"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[currentPeriod(), ...Array.from({ length: 5 }, (_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - (i + 1));
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                })].map((key) => (
                  <SelectItem key={key} value={key}>{periodToLabel(key)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => feeService.generate({ period })}
            >
              Generate invoices for {periodToLabel(period, { short: true })}
            </Button>
          </CardContent>
        </Card>
      </div>

      <StudentFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTarget(null); }}
        student={editTarget}
      />
    </div>
  );
}
