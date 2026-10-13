import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      tone: {
        default: 'border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-400',
        neutral: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300',
        success: 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-400',
        warning: 'border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-400',
        destructive: 'border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-400',
        info: 'border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-400',
        muted: 'border-slate-200/60 bg-slate-100/60 text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400',
        outline: 'border-slate-200 bg-transparent text-slate-800 dark:border-slate-800 dark:text-slate-200',
      },
      size: {
        default: 'text-xs',
        sm: 'px-2 py-0.5 text-2xs',
      },
    },
    defaultVariants: { tone: 'default', size: 'default' },
  }
);

export const Badge = ({ className, tone, size, dot = false, children, ...props }) => (
  <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
    {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
    {children}
  </span>
);

export { badgeVariants };
