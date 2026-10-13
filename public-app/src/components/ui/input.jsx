import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    aria-invalid={error || undefined}
    className={cn(
      'flex h-11 w-full rounded-2xl border border-white/90 bg-white/80 px-3.5 py-2 text-sm text-slate-800 shadow-xs transition-all',
      'placeholder:text-slate-400 file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'focus-visible:outline-none focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 backdrop-blur-sm hover:bg-white',
      'disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-900',
      error && 'border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/20',
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
      'flex w-full rounded-2xl border border-white/90 bg-white/80 px-3.5 py-2.5 text-sm text-slate-800 shadow-xs transition-all',
      'placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 backdrop-blur-sm hover:bg-white',
      'disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-900',
      error && 'border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/20',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
