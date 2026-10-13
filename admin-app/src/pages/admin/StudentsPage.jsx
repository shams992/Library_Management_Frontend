import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Search, Users, UserCheck, UserMinus, Filter } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Toolbar, ToolbarGroup } from '../../components/common/Toolbar.jsx';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { adminService } from '../../services/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney, formatNumber } from '../../utils/format.js';

/** Platform-wide student view: usage per library, not per-student management. */
export default function AdminStudentsPage() {
  const currency = useCurrency();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'students', { search: debouncedSearch, status, page, limit }],
    queryFn: () => adminService.students({ search: debouncedSearch, status, page, limit }),
    keepPreviousData: true,
  });

  const students = data?.data || [];
  const meta = data?.meta;
  const counts = meta?.counts || {};

  const columns = [
    {
      key: 'fullName',
      label: 'Student',
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium">{row.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.studentCode || '—'} · {row.phone}</p>
        </div>
      ),
    },
    {
      key: 'library',
      label: 'Library',
      render: (row) => (
        <div className="text-sm">
          <Link to={`/admin/libraries/${row.libraryId?._id || row.libraryId}`} className="font-medium hover:text-primary">
            {row.libraryId?.name || '—'}
          </Link>
          <p className="text-xs text-muted-foreground">{row.libraryId?.city || ''}</p>
        </div>
      ),
    },
    { key: 'seatNumber', label: 'Seat', render: (row) => (row.seatNumber ? <Badge tone="info">{row.seatNumber}</Badge> : <span className="text-xs text-muted-foreground">—</span>) },
    { key: 'monthlyFee', label: 'Monthly fee', align: 'right', render: (row) => formatMoney(row.monthlyFee, currency) },
    { key: 'registrationDate', label: 'Joined', render: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.registrationDate)}</span> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} kind="student" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All students"
        description="Every student across the platform. Student records stay owned by each library — this view is for support and oversight."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={formatNumber(counts.total)} icon={Users} tone="primary" loading={isLoading} />
        <StatCard label="Active" value={formatNumber(counts.active)} icon={UserCheck} tone="success" loading={isLoading} />
        <StatCard label="Pending applications" value={formatNumber(counts.pending)} tone="warning" loading={isLoading} />
        <StatCard label="Left / churned" value={formatNumber(counts.left)} icon={UserMinus} tone="muted" loading={isLoading} />
      </div>

      <Card>
        <div className="border-b border-border p-4">
          <Toolbar>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search student, code, phone or library…"
                className="pl-9"
                aria-label="Search students"
              />
            </div>
            <ToolbarGroup>
              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Status"><Filter className="mr-1.5 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="fee_due">Fee due</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                </SelectContent>
              </Select>
            </ToolbarGroup>
          </Toolbar>
        </div>

        <DataTable
          columns={columns}
          rows={students}
          loading={isLoading}
          emptyState={
            <EmptyState
              illustration="students"
              title={search || status !== 'all' ? 'No students match these filters' : 'No students on the platform yet'}
              description={
                search || status !== 'all'
                  ? 'Try another search term or clear the status filter.'
                  : 'Students appear here once libraries start adding them.'
              }
              action={search || status !== 'all' ? <Button variant="outline" onClick={() => { setSearch(''); setStatus('all'); }}>Clear filters</Button> : null}
            />
          }
          mobileCard={(row) => (
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{row.fullName}</p>
                  <p className="text-xs text-muted-foreground">{row.libraryId?.name || '—'} · {row.phone}</p>
                </div>
                <StatusBadge status={row.status} kind="student" />
              </div>
              <p className="text-xs text-muted-foreground">
                Seat {row.seatNumber || '—'} · {formatMoney(row.monthlyFee, currency)}/month
              </p>
            </div>
          )}
        />

        {students.length ? <Pagination meta={meta} entity="students" onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} /> : null}
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Privacy note: student details are visible to platform administration only for support, billing verification and
            abuse handling. Libraries own their data and can export it at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
