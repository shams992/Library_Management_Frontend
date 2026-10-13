import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const alertTones = {
  info: { icon: Info, className: 'border-info/25 bg-info/8 text-info' },
  success: { icon: CheckCircle2, className: 'border-success/25 bg-success/8 text-success' },
  warning: { icon: AlertTriangle, className: 'border-warning/25 bg-warning/8 text-warning' },
  destructive: { icon: XCircle, className: 'border-destructive/25 bg-destructive/8 text-destructive' },
};

/** Inline alert used for form-level errors, subscription warnings, hints. */
export const Alert = ({ tone = 'info', title, children, className, action, icon = true }) => {
  const config = alertTones[tone] || alertTones.info;
  const Icon = config.icon;
  return (
    <div
      role={tone === 'destructive' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-xl border p-3.5 text-sm', config.className, className)}
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
