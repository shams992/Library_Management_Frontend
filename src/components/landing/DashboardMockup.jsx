import { Bell, LayoutDashboard, LayoutGrid, ReceiptText, Settings, TrendingUp, Users } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const BARS = [42, 58, 46, 72, 64, 88, 76];
const SEATS = Array.from({ length: 24 }, (_, i) => (i % 5 === 0 || i % 7 === 0 ? 'occupied' : 'available'));

/**
 * Pure-CSS product mockup for the hero.
 * It mirrors the real dashboard layout (sidebar, KPI row, chart, seat grid) so
 * visitors see the actual product — no stock screenshot, no external asset.
 */
export const DashboardMockup = ({ className }) => (
  <div
    className={cn(
      'relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg',
      className
    )}
    role="img"
    aria-label="Preview of the LibraDesk librarian dashboard"
  >
    {/* Window chrome */}
    <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
      <div className="mx-auto hidden items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-[0.65rem] text-muted-foreground sm:flex">
        libradesk.app/librarian
      </div>
    </div>

    <div className="flex">
      {/* Sidebar */}
      <aside className="hidden w-[168px] shrink-0 flex-col gap-1 border-r border-border bg-muted/30 p-3 sm:flex">
        <div className="mb-2 flex items-center gap-2 px-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[0.6rem] font-bold text-primary-foreground">LD</span>
          <span className="text-[0.7rem] font-semibold">Al-Hikmah</span>
        </div>
        {[
          { icon: LayoutDashboard, label: 'Dashboard', active: true },
          { icon: Users, label: 'Students' },
          { icon: LayoutGrid, label: 'Seats' },
          { icon: ReceiptText, label: 'Fees' },
          { icon: TrendingUp, label: 'Finance' },
          { icon: Settings, label: 'Settings' },
        ].map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.68rem] font-medium',
              active ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </div>
        ))}
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-3 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-2.5 w-24 rounded-full bg-foreground/80" />
            <div className="mt-1.5 h-2 w-16 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card">
              <Bell className="h-3 w-3 text-muted-foreground" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
            </span>
            <span className="h-6 w-6 rounded-full bg-primary-soft" />
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: 'Students', value: '142', tone: 'text-foreground' },
            { label: 'Seats free', value: '36', tone: 'text-success' },
            { label: 'Unpaid', value: '18', tone: 'text-destructive' },
            { label: 'Profit (mo)', value: 'Rs 84k', tone: 'text-primary' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-border bg-background p-2.5">
              <p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
              <p className={cn('mt-1 text-sm font-semibold tabular-nums', kpi.tone)}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          {/* Chart card */}
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[0.65rem] font-semibold">Income vs Expenses</p>
              <span className="rounded-full bg-success/12 px-1.5 py-0.5 text-[0.55rem] font-medium text-success">+12.4%</span>
            </div>
            <div className="flex h-24 items-end gap-2">
              {BARS.map((height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end gap-0.5" style={{ height: '100%' }}>
                    <span className="w-1/2 rounded-t-sm bg-success/70" style={{ height: `${height}%` }} />
                    <span className="w-1/2 rounded-t-sm bg-destructive/55" style={{ height: `${Math.max(22, height - 26)}%` }} />
                  </div>
                  <span className="text-[0.5rem] text-muted-foreground">M{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Seat map card */}
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[0.65rem] font-semibold">Seat map</p>
              <span className="text-[0.55rem] text-muted-foreground">120 seats</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {SEATS.map((status, index) => (
                <span
                  key={index}
                  className={cn(
                    'flex h-6 items-center justify-center rounded-md text-[0.5rem] font-medium',
                    status === 'occupied' ? 'bg-primary/15 text-primary' : 'bg-success/12 text-success'
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Table snippet */}
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          {[
            { name: 'Ahmed Khan', seat: '12', fee: 'Paid', tone: 'text-success' },
            { name: 'Fatima Sheikh', seat: '27', fee: 'Unpaid', tone: 'text-destructive' },
            { name: 'Bilal Raza', seat: '08', fee: 'Paid', tone: 'text-success' },
          ].map((row) => (
            <div key={row.name} className="flex items-center justify-between border-b border-border/70 px-3 py-2 last:border-0">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-muted" />
                <span className="text-[0.68rem] font-medium">{row.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[0.62rem] text-muted-foreground">Seat {row.seat}</span>
                <span className={cn('text-[0.62rem] font-medium', row.tone)}>{row.fee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
