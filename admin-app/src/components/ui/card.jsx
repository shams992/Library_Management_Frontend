import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-3xl border border-white/80 bg-white/75 text-card-foreground shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 transition-all duration-200', className)} {...props} />
));
Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5 sm:p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(({ className, as: Comp = 'h3', ...props }, ref) => (
  <Comp ref={ref} className={cn('text-base font-semibold leading-none tracking-tight', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center gap-3 p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';
