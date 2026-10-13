import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card } from '../ui/card.jsx';
import { Skeleton } from '../ui/misc.jsx';
import { cn } from '../../utils/cn.js';

const TONES = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/14 text-warning',
  destructive: 'bg-destructive/12 text-destructive',
  info: 'bg-info/12 text-info',
};

/**
 * Dashboard KPI tile. Values come straight from the API — the component never
 * invents numbers; when data is missing it renders a skeleton instead.
 */
export const StatCard = ({
  label, value, hint, icon: Icon, tone = 'default', trend, loading = false, onClick, className, valueClassName,
}) => {
  const TrendIcon = trend?.direction === 'up' ? ArrowUpRight : trend?.direction === 'down' ? ArrowDownRight : Minus;

  return (
    <Card
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={cn(
        'p-4 text-left transition-all duration-300 sm:p-5',
        onClick && 'hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p className={cn('stat-value', valueClassName)}>{value}</p>
          )}
          {hint && !loading ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TONES[tone] || TONES.default)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      {trend ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium',
              trend.direction === 'up' && 'bg-success/12 text-success',
              trend.direction === 'down' && 'bg-destructive/12 text-destructive',
              trend.direction === 'flat' && 'bg-muted text-muted-foreground'
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {trend.value}
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      ) : null}
    </Card>
  );
};
