import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2, CheckCircle2, Clock, Eye, MoreHorizontal, RefreshCw, Search, TriangleAlert, Users, XCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Toolbar, ToolbarGroup } from '../../components/common/Toolbar.jsx';
import { Card } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';
import { AdminActionDialog } from '../../components/admin/AdminActionDialog.jsx';
import { libraryService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney, formatNumber } from '../../utils/format.js';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'trial', label: 'On trial' },
  { value: 'active', label: 'Active' },
  { value: 'payment_due', label: 'Payment due' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
];

/** Platform admin: every library on the platform, with lifecycle actions. */
export default function AdminLibrariesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currency = useCurrency();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const status = searchParams.get('status') || 'all';
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [action, setAction] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['libraries', 'admin', { search: debouncedSearch, status, city, sortBy, page, limit }],
    queryFn: () => libraryService.adminList({ search: debouncedSearch, status, city, sortBy, page, limit }),
    keepPreviousData: true,
  });

  const libraries = data?.data || [];
  const meta = data?.meta;
  const counts = meta?.counts || {};

  const recalcMutation = useApiMutation({
    mutationFn: (id) => libraryService.recalculate(id),
    invalidate: ['libraries', 'admin'],
    successMessage: 'Counters recalculated',
    onSuccess: () => refetch(),
  });

  const setStatus = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next && next !== 'all') params.set('status', next);
    else params.delete('status');
    setSearchParams(params, { replace: true });
    setPage(1);
  };

  const columns = [
    {
      key: 'name',
      label: 'Library',
      render: (row) => (
        <div className="min-w-0">
          <Link to={`/admin/libraries/${row.id}`} className="truncate font-medium hover:text-primary">{row.name}</Link>
          <p className="text-xs text-muted-foreground">
            {row.city}{row.province ? `, ${row.province}` : ''} · {row.libraryType?.replace('_', ' ')}
          </p>
        </div>
      ),
    },
    {
      key: 'ownerName',
      label: 'Owner',
      render: (row) => (
        <div className="text-sm">
          <p>{row.ownerName}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'stats',
      label: 'Usage',
      render: (row) => (
        <div className="text-xs text-muted-foreground">
          <p>{formatNumber(row.stats?.totalStudents || 0)} students</p>
          <p>{formatNumber(row.stats?.occupiedSeats || 0)}/{formatNumber(row.stats?.totalSeats || 0)} seats occupied</p>
        </div>
      ),
    },
    {
      key: 'subscription',
      label: 'Subscription',
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.subscription?.status || row.status} kind="library" />
          {row.subscription?.status === 'trial' && row.subscription?.trialEndDate ? (
            <p className="text-xs text-muted-foreground">trial ends {formatDate(row.subscription.trialEndDate, { day: '2-digit', month: 'short' })}</p>
          ) : null}
          {row.subscription?.nextPaymentDate ? (
            <p className="text-xs text-muted-foreground">next payment {formatDate(row.subscription.nextPaymentDate, { day: '2-digit', month: 'short' })}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'revenue',
      label: 'Paid to date',
      align: 'right',
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium">{formatMoney(row.totalPaid || 0, currency)}</p>
          <p className="text-xs text-muted-foreground">{formatMoney(row.subscription?.amount || 0, currency)}/month</p>
        </div>
      ),
    },
    { key: 'createdAt', label: 'Registered', render: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.createdAt, { day: '2-digit', month: 'short', year: '2-digit' })}</span> },
    { key: 'status', label: 'Account', render: (row) => <StatusBadge status={row.status} kind="library" /> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.name}`}><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/libraries/${row.id}`)}>
              <Eye className="h-3.5 w-3.5" /> Open detail
            </DropdownMenuItem>
            {row.status === 'pending' ? (
              <>
                <DropdownMenuItem onClick={() => setAction({ type: 'approve', library: row })}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve &amp; start trial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAction({ type: 'reject', library: row })}>
                  <XCircle className="h-3.5 w-3.5" /> Reject application
                </DropdownMenuItem>
              </>
            ) : null}
            {['pending', 'rejected'].includes(row.status) ? null : (
              <>
                <DropdownMenuItem onClick={() => setAction({ type: 'recordPayment', library: row })}>
                  Record subscription payment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAction({ type: 'extend', library: row })}>Extend subscription</DropdownMenuItem>
                {row.status === 'suspended' ? (
                  <DropdownMenuItem onClick={() => setAction({ type: 'activate', library: row })}>Restore access</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setAction({ type: 'suspend', library: row })}>
                    Suspend access
                  </DropdownMenuItem>
                )}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => recalcMutation.mutate(row.id)}>
              <RefreshCw className="h-3.5 w-3.5" /> Recalculate counters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Libraries"
        description="Approve new libraries, manage subscriptions and keep an eye on platform-wide usage."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All libraries" value={formatNumber(counts.all)} icon={Building2} tone="primary" loading={isLoading} />
        <StatCard label="Pending approval" value={formatNumber(counts.pending)} icon={Clock} tone="warning" loading={isLoading} />
        <StatCard label="On trial" value={formatNumber(counts.trial)} icon={Users} tone="info" loading={isLoading} />
        <StatCard label="Paying / suspended" value={`${formatNumber(counts.active)} / ${formatNumber(counts.suspended)}`} icon={TriangleAlert} tone="success" loading={isLoading} />
      </div>

      <Card>
        <div className="border-b border-border p-4">
          <Toolbar>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search library, owner, city or phone…"
                className="pl-9"
                aria-label="Search libraries"
              />
            </div>
            <ToolbarGroup>
              <Input
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                placeholder="City"
                className="w-full sm:w-[140px]"
                aria-label="Filter by city"
              />
              <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[170px]" aria-label="Sort by"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest first</SelectItem>
                  <SelectItem value="name">Name (A–Z)</SelectItem>
                  <SelectItem value="students">Most students</SelectItem>
                  <SelectItem value="trialEnd">Trial ending soonest</SelectItem>
                </SelectContent>
              </Select>
            </ToolbarGroup>
          </Toolbar>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.value}
                size="xs"
                variant={status === tab.value ? 'default' : 'outline'}
                onClick={() => setStatus(tab.value)}
              >
                {tab.label}
                {counts[tab.value] !== undefined ? <span className="ml-1 tabular-nums opacity-70">{counts[tab.value]}</span> : null}
              </Button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={libraries}
          loading={isLoading}
          onRowClick={(row) => navigate(`/admin/libraries/${row.id}`)}
          emptyState={
            <EmptyState
              illustration="libraries"
              title={search || city || status !== 'all' ? 'No libraries match these filters' : 'No libraries registered yet'}
              description={
                search || city || status !== 'all'
                  ? 'Try a different search, city or status filter.'
                  : 'As soon as a library registers it will appear here for approval.'
              }
              action={
                search || city || status !== 'all' ? (
                  <Button variant="outline" onClick={() => { setSearch(''); setCity(''); setStatus('all'); }}>Clear filters</Button>
                ) : null
              }
            />
          }
          mobileCard={(row) => (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">{row.city} · {row.ownerName}</p>
                </div>
                <StatusBadge status={row.status} kind="library" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatNumber(row.stats?.totalStudents || 0)} students · {formatNumber(row.stats?.totalSeats || 0)} seats</span>
                <span>{formatMoney(row.subscription?.amount || 0, currency)}/mo</span>
              </div>
              <Button size="xs" variant="outline" className="w-full" onClick={() => navigate(`/admin/libraries/${row.id}`)}>
                Open library
              </Button>
            </div>
          )}
        />

        {libraries.length ? <Pagination meta={meta} entity="libraries" onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} /> : null}
      </Card>

      <AdminActionDialog
        action={action}
        onClose={() => setAction(null)}
        onDone={() => refetch()}
      />
    </div>
  );
}
