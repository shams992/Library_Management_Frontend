import { useEffect, useMemo, useState } from 'react';
import { Armchair, Check, Info, Layers, Wrench } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/misc.jsx';
import { EmptyState } from '../ui/empty-state.jsx';
import { cn } from '../../utils/cn.js';
import { formatMoney } from '../../utils/format.js';

/**
 * Visual seat map.
 *
 * A seat counts as ASSIGNED when the backend status says occupied OR the seat
 * carries an occupant reference (studentId / occupiedBy / student). We never rely
 * on `status === 'occupied'` alone, because a student can be attached to a seat
 * without the status flag having been rewritten.
 *
 * Colours (shared with the legend):
 *   assigned    → amber / warning
 *   available   → emerald / success
 *   reserved    → blue / info
 *   maintenance → grey / muted
 */
export const isSeatAssigned = (seat) => Boolean(
  seat && (seat.status === 'occupied' || seat.occupiedBy || seat.studentId || seat.student)
);

export const seatVisualStatus = (seat) => {
  if (!seat) return 'available';
  if (isSeatAssigned(seat)) return 'assigned';
  if (seat.status === 'maintenance') return 'maintenance';
  if (seat.status === 'reserved') return 'reserved';
  return 'available';
};

const VISUALS = {
  assigned: {
    tile: 'border-warning/45 bg-warning/12 text-warning hover:border-warning/70',
    label: 'Assigned',
  },
  available: {
    tile: 'border-success/40 bg-success/10 text-success hover:border-success/70',
    label: 'Available',
  },
  reserved: {
    tile: 'border-info/40 bg-info/10 text-info hover:border-info/70',
    label: 'Reserved',
  },
  maintenance: {
    tile: 'border-border bg-muted text-muted-foreground hover:border-border',
    label: 'Maintenance',
  },
};

export const SeatLegend = ({ summary }) => (
  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
    {Object.entries(VISUALS).map(([key, visual]) => (
      <span key={key} className="inline-flex items-center gap-2">
        <span className={cn('h-3 w-3 rounded-sm border', visual.tile)} aria-hidden="true" />
        {visual.label}
        {summary ? (
          <span className="tabular-nums text-foreground/70">{summary[key === 'assigned' ? 'occupied' : key] ?? 0}</span>
        ) : null}
      </span>
    ))}
  </div>
);

const SeatTile = ({ seat, currency, onSelect, selected }) => {
  const visual = VISUALS[seatVisualStatus(seat)];
  const occupant = seat.student || (seat.studentName ? { name: seat.studentName, code: seat.studentCode } : null);
  const assigned = isSeatAssigned(seat);

  const tile = (
    <button
      type="button"
      onClick={() => onSelect?.(seat)}
      aria-pressed={selected || undefined}
      aria-label={`Seat ${seat.number} — ${visual.label}${occupant?.name ? `, ${occupant.name}` : ''}`}
      className={cn(
        'group relative flex h-[74px] w-full flex-col items-center justify-center gap-1 rounded-lg border px-1.5 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        visual.tile,
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      <span className="text-[13px] font-semibold tabular-nums">{seat.number}</span>
      {assigned ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : seat.status === 'maintenance' ? (
        <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Armchair className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
      )}
      {occupant?.name ? (
        <span className="line-clamp-1 w-full text-[10px] font-medium text-foreground/75">{occupant.name}</span>
      ) : (
        <span className="text-[10px] uppercase tracking-wide opacity-70">{visual.label}</span>
      )}
    </button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{tile}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px]">
        <p className="text-xs font-semibold">Seat {seat.number} · {visual.label}</p>
        {occupant ? (
          <>
            <p className="mt-0.5 text-xs">
              {occupant.name}
              {occupant.code ? ` · ${occupant.code}` : ''}
            </p>
            {occupant.phone ? <p className="text-xs opacity-80">{occupant.phone}</p> : null}
            {occupant.monthlyFee !== undefined && occupant.monthlyFee !== null ? (
              <p className="text-xs opacity-80">{formatMoney(occupant.monthlyFee, currency)} / month</p>
            ) : null}
          </>
        ) : (
          <p className="mt-0.5 text-xs opacity-80">
            {seat.zone || 'Main Hall'}
            {seat.notes ? ` · ${seat.notes}` : ''}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * @param seats      flat array of seats (id, number, zone, floor, status, student/studentId)
 * @param summary    optional { total, occupied, available, reserved, maintenance }
 * @param onSelect   click handler for a seat tile
 * @param selectedId id of the currently selected seat
 */
export const SeatMap = ({ seats = [], summary, onSelect, selectedId, currency, loading = false, emptyAction = null }) => {
  const floors = useMemo(() => {
    const set = new Set(seats.map((seat) => Number(seat.floor) || 0));
    return [...set].sort((a, b) => a - b);
  }, [seats]);

  const [activeFloor, setActiveFloor] = useState(floors[0] ?? 0);

  useEffect(() => {
    if (!floors.includes(activeFloor)) setActiveFloor(floors[0] ?? 0);
  }, [floors, activeFloor]);

  const grouped = useMemo(() => {
    const zones = new Map();
    seats
      .filter((seat) => (Number(seat.floor) || 0) === activeFloor)
      .sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true }))
      .forEach((seat) => {
        const zone = seat.zone || 'Main Hall';
        if (!zones.has(zone)) zones.set(zone, []);
        zones.get(zone).push(seat);
      });
    return [...zones.entries()];
  }, [seats, activeFloor]);

  if (loading) {
    return (
      <div className="space-y-5">
        {[0, 1].map((zone) => (
          <div key={zone} className="space-y-2">
            <div className="skeleton h-4 w-40 rounded" />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="skeleton h-[74px] rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!seats.length) {
    return (
      <EmptyState
        illustration="seats"
        title="No seats configured yet"
        description="Create your seat layout once — then assign students in a single click and see instantly which seats are free."
        action={emptyAction}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SeatLegend summary={summary} />
          {floors.length > 1 ? (
            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5" role="tablist" aria-label="Floor">
              <Layers className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              {floors.map((floor) => (
                <button
                  key={floor}
                  type="button"
                  role="tab"
                  aria-selected={activeFloor === floor}
                  onClick={() => setActiveFloor(floor)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    activeFloor === floor ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {floor === 0 ? 'Ground' : `Floor ${floor}`}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="seat-floor">
          <p className="mb-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Entrance</p>
          {grouped.map(([zone, zoneSeats]) => (
            <section key={zone} className="mb-6 last:mb-0">
              <header className="mb-2.5 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold">{zone}</h4>
                <span className="text-xs text-muted-foreground">
                  {zoneSeats.filter(isSeatAssigned).length} / {zoneSeats.length} assigned
                </span>
              </header>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
                {zoneSeats.map((seat) => (
                  <SeatTile key={seat.id} seat={seat} currency={currency} onSelect={onSelect} selected={selectedId === seat.id} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Click any seat to see or change who sits there. Amber tiles have a student attached — hover a tile for their details.
        </p>
      </div>
    </TooltipProvider>
  );
};

export default SeatMap;
