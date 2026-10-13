import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    aria-invalid={error || undefined}
    className={cn(
      'flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors',
      'placeholder:text-muted-foreground/70 file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25',
      'disabled:cursor-not-allowed disabled:opacity-60',
      error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = forwardRef(({ className, error, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    aria-invalid={error || undefined}
    className={cn(
      'flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors',
      'placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25',
      'disabled:cursor-not-allowed disabled:opacity-60',
      error && 'border-destructive focus-visible:ring-destructive/20',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
