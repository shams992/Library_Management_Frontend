import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Skeleton } from '../ui/misc.jsx';
import { cn } from '../../utils/cn.js';

const TONES = {
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  primary: 'bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400',
  destructive: 'bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400',
  info: 'bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400',
};

const SPARK_COLORS = {
  default: '#94A3B8',
  primary: '#A855F7',
  purple: '#A855F7',
  success: '#10B981',
  teal: '#14B8A6',
  warning: '#F59E0B',
  destructive: '#F43F5E',
  info: '#0EA5E9',
};

/**
 * Modern LibraDesk glass KPI card with pastel squircle icons,
 * top-right trend pill, bold value, hint, and mini sparkline wave/bars/ring.
 */
export const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  trend,
  sparkline = 'wave',
  loading = false,
  onClick,
  className,
  valueClassName,
}) => {
  const TrendIcon = trend?.direction === 'down' ? ArrowDownRight : trend?.direction === 'flat' ? Minus : ArrowUpRight;
  const strokeColor = SPARK_COLORS[tone] || SPARK_COLORS.default;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:border-white dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]',
        onClick && 'cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500',
        className
      )}
      onClick={onClick}
    >
      {/* Top Row: Icon + Label + Trend Pill */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon ? (
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-110', TONES[tone] || TONES.default)}>
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          ) : null}
          <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</p>
        </div>

        {trend ? (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold border transition-colors',
              trend.direction === 'down'
                ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/50'
                : trend.direction === 'flat'
                  ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50'
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {trend.value}
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/80 px-2 py-0.5 text-[11px] font-bold dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50">
            <ArrowUpRight className="h-3 w-3" /> 0%
          </span>
        )}
      </div>

      {/* Metric Value */}
      <div className="mt-3.5">
        {loading ? (
          <Skeleton className="h-9 w-28 rounded-xl" />
        ) : (
          <p className={cn('text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white', valueClassName)}>
            {value}
          </p>
        )}
      </div>

      {/* Bottom Row: Subtitle / Hint + Mini Sparkline Graphic */}
      <div className="mt-2.5 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          {hint && !loading ? (
            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{hint}</p>
          ) : (
            <p className="text-xs text-transparent select-none">&nbsp;</p>
          )}
        </div>

        {/* Mini Sparkline Visualization */}
        {!loading && sparkline !== 'none' ? (
          <div className="h-7 w-16 shrink-0 flex items-end justify-end">
            {sparkline === 'bars' ? (
              <div className="flex items-end gap-1 h-6">
                <span className="w-1.5 rounded-full bg-emerald-300 dark:bg-emerald-600 h-2" />
                <span className="w-1.5 rounded-full bg-emerald-300 dark:bg-emerald-600 h-3" />
                <span className="w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 h-4" />
                <span className="w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 h-5" />
                <span className="w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-300 h-6" />
              </div>
            ) : sparkline === 'ring' ? (
              <div className="relative h-6 w-6">
                <svg viewBox="0 0 36 36" className="h-6 w-6 -rotate-90">
                  <path
                    className="text-amber-100 dark:text-amber-950"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeWidth="3.5"
                    strokeDasharray="35, 100"
                    strokeLinecap="round"
                    stroke={strokeColor}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            ) : (
              <svg viewBox="0 0 60 24" className="h-6 w-14 overflow-visible">
                <defs>
                  <linearGradient id={`spark-admin-${tone}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 18 C 15 18, 20 8, 35 12 C 45 15, 52 4, 60 6 L 60 24 L 0 24 Z"
                  fill={`url(#spark-admin-${tone})`}
                />
                <path
                  d="M 0 18 C 15 18, 20 8, 35 12 C 45 15, 52 4, 60 6"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

