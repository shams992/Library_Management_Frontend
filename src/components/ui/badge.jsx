import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      tone: {
        default: 'border-transparent bg-primary/10 text-primary',
        neutral: 'border-border bg-muted text-muted-foreground',
        success: 'border-transparent bg-success/12 text-success',
        warning: 'border-transparent bg-warning/14 text-warning',
        destructive: 'border-transparent bg-destructive/12 text-destructive',
        info: 'border-transparent bg-info/12 text-info',
        muted: 'border-border bg-muted/60 text-muted-foreground',
        outline: 'border-border bg-transparent text-foreground',
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
