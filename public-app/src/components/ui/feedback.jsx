import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const alertTones = {
  info: { icon: Info, className: 'border-sky-200/80 bg-sky-50/70 text-sky-900 backdrop-blur-md dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300' },
  success: { icon: CheckCircle2, className: 'border-emerald-200/80 bg-emerald-50/70 text-emerald-900 backdrop-blur-md dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300' },
  warning: { icon: AlertTriangle, className: 'border-amber-200/80 bg-amber-50/70 text-amber-900 backdrop-blur-md dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300' },
  destructive: { icon: XCircle, className: 'border-rose-200/80 bg-rose-50/70 text-rose-900 backdrop-blur-md dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300' },
};

/** Inline alert used for form-level errors, subscription warnings, hints. */
export const Alert = ({ tone = 'info', title, children, className, action, icon = true }) => {
  const config = alertTones[tone] || alertTones.info;
  const Icon = config.icon;
  return (
    <div
      role={tone === 'destructive' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3.5 rounded-2xl border p-4 text-sm shadow-xs transition-all', config.className, className)}
    >
      {icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="font-medium text-foreground">{title}</p> : null}
        {children ? <div className="text-muted-foreground">{children}</div> : null}
      </div>
      {action}
    </div>
  );
};

export const Spinner = ({ className }) => <Loader2 className={cn('h-4 w-4 animate-spin text-muted-foreground', className)} aria-hidden="true" />;

export const LoadingBlock = ({ label = 'Loading…', className }) => (
  <div className={cn('flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground', className)} role="status">
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
    {label}
  </div>
);
