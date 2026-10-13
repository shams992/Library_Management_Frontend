import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatMoney, formatNumber } from '../../utils/format.js';
import { Skeleton } from '../ui/misc.jsx';

const AXIS_STYLE = { fontSize: 12, fill: 'hsl(var(--muted-foreground))' };

const gridProps = {
  strokeDasharray: '3 6',
  stroke: 'hsl(var(--border))',
  vertical: false,
};

/** Shared tooltip so every chart formats money identically. */
const ChartTooltip = ({ currency, active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs shadow-md backdrop-blur">
      {label ? <p className="mb-1.5 font-medium text-foreground">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey || entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: entry.color || entry.fill }} />
              {entry.name}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {typeof entry.value === 'number' && entry.value > 999
                ? formatMoney(entry.value, currency, { compact: true })
                : formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartFrame = ({ height = 280, loading, empty, children, className }) => {
  if (loading) return <Skeleton className={`w-full rounded-xl ${className || ''}`} style={{ height }} />;
  return (
    <div className={className} style={{ width: '100%', height }}>
      {children}
    </div>
  );
};

/** Income vs expenses vs profit — the headline financial chart. */
export const IncomeExpenseChart = ({ data = [], loading, height = 300, showProfit = true }) => {
  const currency = useCurrency();
  return (
    <ChartFrame height={height} loading={loading}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.32} />
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.26} />
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => formatMoney(v, currency, { compact: true })} width={68} />
          <Tooltip content={<ChartTooltip currency={currency} />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Area type="monotone" dataKey="income" name="Income" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#incomeFill)" />
          <Area type="monotone" dataKey="expense" name="Expenses" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#expenseFill)" />
          {showProfit ? (
            <Line type="monotone" dataKey="profit" name="Net profit" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
};

/** Expected vs collected vs pending fees. */
export const FeeCollectionChart = ({ data = [], loading, height = 300 }) => {
  const currency = useCurrency();
  return (
    <ChartFrame height={height} loading={loading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={2}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => formatMoney(v, currency, { compact: true })} width={68} />
          <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: 'hsl(var(--muted))' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="received" name="Collected" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Bar dataKey="pending" name="Pending" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
};

const PIE_COLOURS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))'];

/** Expense category split — donut + legend percentages. */
export const CategoryDonut = ({ data = [], loading, height = 260, nameKey = 'category', valueKey = 'total' }) => {
  const currency = useCurrency();
  const filtered = data.filter((d) => d[valueKey] > 0);
  if (loading) return <Skeleton className="h-[260px] w-full rounded-xl" />;

  if (!filtered.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No expenses recorded for this period
      </div>
    );
  }

  return (
    <ChartFrame height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={filtered} dataKey={valueKey} nameKey={nameKey} innerRadius="58%" outerRadius="82%" paddingAngle={2} strokeWidth={0}>
            {filtered.map((entry, index) => (
              <Cell key={entry[nameKey] || index} fill={PIE_COLOURS[index % PIE_COLOURS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
};

/** Simple sparkline for compact cards. */
export const Sparkline = ({ data = [], dataKey = 'value', loading, height = 48, colour = 'hsl(var(--primary))' }) => {
  if (loading) return <Skeleton className="h-12 w-full" />;
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <Line type="monotone" dataKey={dataKey} stroke={colour} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/** Platform-level charts for the admin console. */
export const PlatformGrowthChart = ({ data = [], loading, height = 300, keys = [] }) => {
  const currency = useCurrency();
  return (
    <ChartFrame height={height} loading={loading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          {keys.some((k) => k.type === 'money') ? (
            <YAxis yAxisId="money" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => formatMoney(v, currency, { compact: true })} width={68} />
          ) : null}
          <YAxis yAxisId="count" orientation={keys.some((k) => k.type === 'money') ? 'right' : 'left'} tick={AXIS_STYLE} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: 'hsl(var(--muted))' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {keys.map((k) => (
            <Bar
              key={k.key}
              yAxisId={k.type === 'money' ? 'money' : 'count'}
              dataKey={k.key}
              name={k.label}
              fill={k.colour}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
};
