import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Armchair, LayoutGrid, List, Plus, RefreshCw, Search, Trash2, UserPlus, Users, Wrench,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Toolbar, ToolbarGroup } from '../../components/common/Toolbar.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { ConfirmDialog } from '../../components/ui/confirm-dialog.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { SeatMap, isSeatAssigned } from '../../components/seats/SeatMap.jsx';
import { SeatFormDialog } from '../../components/seats/SeatFormDialog.jsx';
import { SeatAssignDialog } from '../../components/seats/SeatAssignDialog.jsx';
import { seatService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatMoney } from '../../utils/format.js';

export default function SeatsPage() {
  const currency = useCurrency();
  const [view, setView] = useState('map');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editSeat, setEditSeat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    data: mapData, isLoading: mapLoading, isError: mapError, error: mapErrorObj, refetch, isFetching,
  } = useQuery({
    queryKey: ['seats', 'map'],
    queryFn: () => seatService.map(),
  });

  const seats = mapData?.data?.seats || [];
  const summary = mapData?.data?.summary;

  const filteredSeats = useMemo(
    () =>
      seats.filter((seat) => {
        const term = debouncedSearch.trim().toLowerCase();
        const occupantName = seat.student?.name || '';
        const matchesSearch =
          !term ||
          String(seat.number).toLowerCase().includes(term) ||
          occupantName.toLowerCase().includes(term) ||
          (seat.zone || '').toLowerCase().includes(term);
        const assigned = isSeatAssigned(seat);
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'assigned' ? assigned : !assigned && seat.status === statusFilter);
        return matchesSearch && matchesStatus;
      }),
    [seats, debouncedSearch, statusFilter]
  );

  const reconcileMutation = useApiMutation({
    mutationFn: () => seatService.reconcile(),
    invalidate: ['seats', 'students', 'dashboard', 'library'],
    successMessage: (response) => response?.message || 'Seat occupancy reconciled',
    onSuccess: () => refetch(),
  });

  const deleteMutation = useApiMutation({
    mutationFn: (id) => seatService.remove(id),
    invalidate: ['seats', 'dashboard', 'library'],
    successMessage: 'Seat removed',
    onSuccess: () => { setDeleteTarget(null); refetch(); },
  });

  const columns = [
    { key: 'number', label: 'Seat', render: (row) => <span className="font-semibold tabular-nums">{row.number}</span> },
    { key: 'zone', label: 'Zone', render: (row) => <Badge tone="muted">{row.zone || 'Main Hall'}</Badge> },
    {
      key: 'floor',
      label: 'Floor',
      render: (row) => <span className="text-sm text-muted-foreground">{Number(row.floor) ? `Floor ${row.floor}` : 'Ground'}</span>,
    },
    {
      key: 'occupant',
      label: 'Occupant',
      render: (row) =>
        isSeatAssigned(row) ? (
          <div className="text-sm">
            <Link to={`/librarian/students/${row.student?.id}`} className="font-medium hover:text-primary">
              {row.student?.name || 'Assigned student'}
            </Link>
            <p className="text-xs text-muted-foreground">
              {row.student?.code || '—'}
              {row.student?.monthlyFee !== undefined ? ` · ${formatMoney(row.student.monthlyFee, currency)}/month` : ''}
            </p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Free</span>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={isSeatAssigned(row) ? 'occupied' : row.status} kind="seat" />,
    },
    { key: 'notes', label: 'Notes', render: (row) => <span className="text-xs text-muted-foreground">{row.notes || '—'}</span> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="xs" variant="outline" onClick={() => setSelectedSeat(row)}>
            {isSeatAssigned(row) ? 'Manage' : <><UserPlus className="h-3.5 w-3.5" /> Assign</>}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Edit seat ${row.number}`}
            onClick={() => { setEditSeat(row); setFormOpen(true); }}
          >
            <Wrench className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Delete seat ${row.number}`}
            disabled={isSeatAssigned(row)}
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (mapError) {
    return <Alert tone="destructive" title="Seat map unavailable">{mapErrorObj?.message}</Alert>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seats"
        description="Your layout at a glance — who sits where, which seats are free and which are under maintenance."
        actions={
          <>
            <Button variant="outline" onClick={() => reconcileMutation.mutate()} loading={reconcileMutation.isPending}>
              <RefreshCw className="h-4 w-4" /> Recheck occupancy
            </Button>
            <Button onClick={() => { setEditSeat(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" /> Add seats
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total seats" value={summary?.total ?? 0} icon={Armchair} tone="primary" loading={mapLoading} />
        <StatCard
          label="Assigned"
          value={summary?.occupied ?? 0}
          hint={summary?.total ? `${Math.round((summary.occupied / summary.total) * 100)}% utilisation` : ''}
          tone="warning"
          loading={mapLoading}
        />
        <StatCard
          label="Free now"
          value={summary?.available ?? 0}
          hint={summary?.reserved ? `Includes ${summary.reserved} reserved` : 'Ready to assign'}
          tone="success"
          loading={mapLoading}
        />
        <StatCard label="Maintenance" value={summary?.maintenance ?? 0} hint="Not bookable" tone="muted" loading={mapLoading} />
      </div>

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Seat layout</CardTitle>
            <CardDescription>
              {mapLoading ? 'Loading…' : isFetching ? 'Refreshing…' : `${filteredSeats.length} of ${seats.length} seat(s) shown`}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Seat, zone or student…"
                className="w-full pl-9 sm:w-56"
                aria-label="Search seats"
              />
            </div>
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5" role="group" aria-label="View mode">
              {[
                { value: 'map', label: 'Map', icon: LayoutGrid },
                { value: 'list', label: 'List', icon: List },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
                  aria-pressed={view === option.value}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    view === option.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <option.icon className="h-3.5 w-3.5" /> {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Toolbar>
            <ToolbarGroup>
              {[
                { value: 'all', label: 'All' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'available', label: 'Available' },
                { value: 'reserved', label: 'Reserved' },
                { value: 'maintenance', label: 'Maintenance' },
              ].map((option) => (
                <Button
                  key={option.value}
                  size="xs"
                  variant={statusFilter === option.value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </ToolbarGroup>
            {statusFilter !== 'all' || search ? (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear</Button>
            ) : null}
          </Toolbar>

          {view === 'map' ? (
            <SeatMap
              seats={filteredSeats}
              summary={summary}
              loading={mapLoading}
              currency={currency}
              onSelect={setSelectedSeat}
              selectedId={selectedSeat?.id}
              emptyAction={<Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Create your seat layout</Button>}
            />
          ) : mapLoading ? (
            <LoadingBlock label="Loading seats…" />
          ) : filteredSeats.length === 0 ? (
            <EmptyState
              illustration="seats"
              title="No seats match this filter"
              description="Try another status, or clear the search to see the full layout."
              action={<Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear filters</Button>}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={filteredSeats}
              onRowClick={(row) => setSelectedSeat(row)}
              mobileCard={(row) => (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Seat {row.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.zone} · {isSeatAssigned(row) ? row.student?.name || 'Assigned' : 'Free'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={isSeatAssigned(row) ? 'occupied' : row.status} kind="seat" />
                    <Button size="xs" variant="outline" onClick={() => setSelectedSeat(row)}>
                      {isSeatAssigned(row) ? 'Manage' : 'Assign'}
                    </Button>
                  </div>
                </div>
              )}
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
              <p className="text-sm font-medium">Filling empty seats is the fastest way to grow</p>
              <p className="text-sm text-muted-foreground">
                {summary?.available
                  ? `${summary.available} seat(s) are free right now — check the students list for anyone without a seat.`
                  : 'Every seat is assigned. Add more seats when you are ready to expand.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/librarian/students">Students without seats</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setEditSeat(null); setFormOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> Add seats
            </Button>
          </div>
        </CardContent>
      </Card>

      <SeatFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditSeat(null); }}
        seat={editSeat}
        onDone={() => refetch()}
      />

      <SeatAssignDialog
        seat={selectedSeat}
        open={Boolean(selectedSeat)}
        onOpenChange={(open) => { if (!open) setSelectedSeat(null); }}
        onDone={() => refetch()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Delete seat ${deleteTarget?.number || ''}?`}
        description="The seat will disappear from your layout. Occupied seats cannot be deleted — reassign the student first."
        confirmLabel="Delete seat"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
