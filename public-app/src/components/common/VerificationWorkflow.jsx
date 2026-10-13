import { Check, Clock, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Badge } from '../ui/badge.jsx';

export const VERIFICATION_STEPS = [
  { id: 'pending_payment', label: 'Pending Payment', short: 'Pending', icon: Clock },
  { id: 'payment_submitted', label: 'Payment Submitted', short: 'Submitted', icon: Clock },
  { id: 'under_review', label: 'Under Review', short: 'Reviewing', icon: Eye },
  { id: 'approved', label: 'Approved', short: 'Approved', icon: Check },
  { id: 'active', label: 'Active', short: 'Active', icon: Sparkles },
];

export const getVerificationStepIndex = (status) => {
  switch (status) {
    case 'payment_submitted':
      return 1;
    case 'under_review':
      return 2;
    case 'approved':
      return 3;
    case 'active':
      return 4;
    case 'pending_payment':
    default:
      return 0;
  }
};

export const getVerificationTone = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'approved':
      return 'primary';
    case 'under_review':
      return 'warning';
    case 'payment_submitted':
      return 'info';
    case 'pending_payment':
    default:
      return 'muted';
  }
};

export function VerificationStatusBadge({ status = 'pending_payment', className = '' }) {
  const step = VERIFICATION_STEPS.find((s) => s.id === status) || VERIFICATION_STEPS[0];
  const tone = getVerificationTone(status);

  return (
    <Badge tone={tone} className={cn('capitalize font-medium tracking-tight', className)}>
      {step.label}
    </Badge>
  );
}

export function VerificationStepper({ currentStatus = 'pending_payment', className = '' }) {
  const currentIndex = getVerificationStepIndex(currentStatus);

  return (
    <div className={cn('space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Payment Verification Workflow
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            Current Status: <span className="text-primary">{VERIFICATION_STEPS[currentIndex]?.label}</span>
          </p>
        </div>
        <VerificationStatusBadge status={currentStatus} />
      </div>

      {/* Progress Track */}
      <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1" aria-label="Verification progress">
        {VERIFICATION_STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex flex-col justify-between rounded-xl border p-2.5 transition-all',
                isCurrent && 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs',
                isDone && 'border-success/30 bg-success/5',
                !isCurrent && !isDone && 'border-border bg-muted/20 opacity-70'
              )}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    isDone && 'bg-success text-success-foreground',
                    isCurrent && 'bg-primary text-primary-foreground',
                    !isDone && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </span>
                <span className="text-[0.65rem] uppercase font-bold text-muted-foreground">
                  Step {idx + 1}
                </span>
              </div>
              <p
                className={cn(
                  'text-xs font-semibold leading-tight',
                  isCurrent ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
