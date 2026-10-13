import { forwardRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../utils/cn.js';

export const Label = forwardRef(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-sm font-medium leading-none text-foreground/90 peer-disabled:opacity-60', className)}
    {...props}
  >
    {children}
    {required ? <span className="ml-0.5 text-destructive" aria-hidden="true">*</span> : null}
  </LabelPrimitive.Root>
));
Label.displayName = 'Label';

/** Field wrapper: label + control + hint/error, with consistent spacing. */
export const Field = ({ label, htmlFor, error, hint, required, className, children }) => (
  <div className={cn('space-y-1.5', className)}>
    {label ? <Label htmlFor={htmlFor} required={required}>{label}</Label> : null}
    {children}
    {error ? (
      <p role="alert" className="text-xs font-medium text-destructive">{error}</p>
    ) : hint ? (
      <p className="text-xs text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);
