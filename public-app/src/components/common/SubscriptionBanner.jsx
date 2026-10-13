import { AlertTriangle, CalendarClock, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button.jsx';
import { StatusBadge } from '../ui/status-badge.jsx';
import { formatDate, daysLeftLabel } from '../../utils/format.js';

/**
 * Subscription strip shown across the librarian dashboard:
 * trial countdown → payment due warning → suspended notice.
 * Suspension never removes data; the banner makes that explicit.
 */
export const SubscriptionBanner = ({ library, subscription, className }) => {
  if (!library || !subscription) return null;
  const status = subscription.status || library.status;

  if (status === 'active') return null;

  const config = {
    trial: {
      tone: 'info',
      icon: CalendarClock,
      title: 'You are on the free trial',
      body: library.trialDaysLeft ?? null,
    },
    payment_due: {
      tone: 'warning',
      icon: AlertTriangle,
      title: 'Subscription payment is due',
      body: 'Please settle your invoice to keep your dashboard active. Grace period applies.',
    },
    suspended: {
      tone: 'destructive',
      icon: ShieldAlert,
      title: 'Your library dashboard is suspended',
      body: 'Your students, fees, employees and records are completely safe. Contact platform support to reactivate.',
    },
    pending: {
      tone: 'warning',
      icon: CalendarClock,
      title: 'Awaiting admin approval',
      body: 'Your library registration is under review. You will be notified once approved.',
    },
  }[status];

  if (!config) return null;
  const Icon = config.icon;

  const toneClasses = {
    info: 'border-sky-200/80 bg-sky-50/70 text-sky-900 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300',
    warning: 'border-amber-200/80 bg-amber-50/70 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300',
    destructive: 'border-rose-200/80 bg-rose-50/70 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300',
  }[config.tone];

  return (
    <div className={`flex flex-col gap-3.5 rounded-3xl border p-4 sm:flex-row sm:items-center sm:justify-between backdrop-blur-xl shadow-xs transition-all ${toneClasses} ${className || ''}`}>
      <div className="flex items-start gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900 dark:text-white">{config.title}</p>
            <StatusBadge status={status} kind="library" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {typeof config.body === 'number' ? `${daysLeftLabel(config.body)} · trial ends ${formatDate(subscription.trialEndDate)}` : config.body}
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant={config.tone === 'destructive' ? 'destructive' : 'outline'} className="shrink-0 rounded-full bg-white/90 hover:bg-white text-slate-800 border border-slate-200/80 shadow-xs dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-200">
        <Link to="/librarian/subscription">{config.tone === 'destructive' ? 'Contact support' : 'View subscription'}</Link>
      </Button>
    </div>
  );
};
