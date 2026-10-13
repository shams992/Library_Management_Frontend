import { cn } from '../../utils/cn.js';

export const PageHeader = ({ title, description, actions, breadcrumb, className, children }) => (
  <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
    <div className="min-w-0 space-y-1.5">
      {breadcrumb ? <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">{breadcrumb}</nav> : null}
      <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
      {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      {children}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </header>
);
