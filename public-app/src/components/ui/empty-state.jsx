import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Every list view renders a real empty state with a way forward — no blank pages.
 * The illustration is inline SVG so it stays crisp in both themes with no requests.
 */
const ILLUSTRATIONS = {
  default: (
    <svg viewBox="0 0 120 90" className="h-24 w-32" role="presentation" aria-hidden="true">
      <rect x="14" y="18" width="92" height="58" rx="8" className="fill-muted" />
      <rect x="24" y="30" width="46" height="6" rx="3" className="fill-muted-foreground/30" />
      <rect x="24" y="44" width="72" height="5" rx="2.5" className="fill-muted-foreground/20" />
      <rect x="24" y="55" width="58" height="5" rx="2.5" className="fill-muted-foreground/20" />
      <circle cx="86" cy="26" r="10" className="fill-primary/20" />
      <path d="M86 22v8M82 26h8" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  students: (
    <svg viewBox="0 0 120 90" className="h-24 w-32" role="presentation" aria-hidden="true">
      <circle cx="44" cy="32" r="13" className="fill-primary/20" />
      <path d="M22 74c0-12 10-20 22-20s22 8 22 20" className="fill-primary/15" />
      <circle cx="82" cy="38" r="9" className="fill-muted-foreground/20" />
      <path d="M68 74c0-9 6-15 14-15s14 6 14 15" className="fill-muted-foreground/15" />
    </svg>
  ),
  seats: (
    <svg viewBox="0 0 120 90" className="h-24 w-32" role="presentation" aria-hidden="true">
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={22 + c * 28}
            y={18 + r * 22}
            width="22"
            height="16"
            rx="4"
            className={(r + c) % 3 === 0 ? 'fill-primary/25' : 'fill-muted-foreground/20'}
          />
        ))
      )}
    </svg>
  ),
  fees: (
    <svg viewBox="0 0 120 90" className="h-24 w-32" role="presentation" aria-hidden="true">
      <rect x="26" y="16" width="68" height="58" rx="8" className="fill-muted" />
      <path d="M38 30h36M38 42h44M38 54h26" className="stroke-muted-foreground/30" strokeWidth="4" strokeLinecap="round" />
      <circle cx="88" cy="62" r="14" className="fill-success/20" />
      <path d="M82 62l4 4 8-9" className="stroke-success" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 120 90" className="h-24 w-32" role="presentation" aria-hidden="true">
      <circle cx="52" cy="40" r="20" className="fill-muted" />
      <circle cx="52" cy="40" r="20" className="stroke-muted-foreground/25" strokeWidth="2" fill="none" />
      <path d="M66 54l18 18" className="stroke-muted-foreground/40" strokeWidth="4" strokeLinecap="round" />
      <path d="M44 40h16" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 120 90" className="h-24 w-32" role="presentation" aria-hidden="true">
      <path d="M60 20c-10 0-17 7-17 17v12l-5 8h44l-5-8V37c0-10-7-17-17-17Z" className="fill-primary/20" />
      <path d="M53 62a7 7 0 0014 0" className="fill-primary/35" />
    </svg>
  ),
};

export const EmptyState = ({
  illustration = 'default',
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/60 text-center',
      compact ? 'px-4 py-8' : 'px-6 py-14',
      className
    )}
  >
    <div className="opacity-90">{ILLUSTRATIONS[illustration] || ILLUSTRATIONS.default}</div>
    <div className="max-w-md space-y-1.5">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
    {action || secondaryAction ? (
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        {action}
        {secondaryAction}
      </div>
    ) : null}
  </div>
);

export const InlineLink = ({ children, className, ...props }) => (
  <a className={cn('inline-flex items-center gap-1 font-medium text-primary hover:underline', className)} {...props}>
    {children}
    <ArrowRight className="h-3.5 w-3.5" />
  </a>
);
