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
    info: 'border-info/25 bg-info/8 text-info',
    warning: 'border-warning/25 bg-warning/8 text-warning',
    destructive: 'border-destructive/25 bg-destructive/8 text-destructive',
  }[config.tone];

  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${toneClasses} ${className || ''}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="space-y-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{config.title}</p>
            <StatusBadge status={status} kind="library" />
          </div>
          <p className="text-muted-foreground">
            {typeof config.body === 'number' ? `${daysLeftLabel(config.body)} · trial ends ${formatDate(subscription.trialEndDate)}` : config.body}
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant={config.tone === 'destructive' ? 'destructive' : 'outline'} className="shrink-0">
        <Link to="/librarian/subscription">{config.tone === 'destructive' ? 'Contact support' : 'View subscription'}</Link>
      </Button>
    </div>
  );
};
