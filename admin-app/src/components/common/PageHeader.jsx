import { cn } from '../../utils/cn.js';

export const PageHeader = ({ title, description, actions, breadcrumb, className, children }) => (
  <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
    <div className="min-w-0 space-y-1.5">
      {breadcrumb ? <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">{breadcrumb}</nav> : null}
      <h1 className="truncate text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">{title}</h1>
      {description ? <p className="max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">{description}</p> : null}
      {children}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </header>
);
