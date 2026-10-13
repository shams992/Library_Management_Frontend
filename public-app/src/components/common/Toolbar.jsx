import { cn } from '../../utils/cn.js';

/** Filter row used at the top of every list view (search + selects + actions). */
export const Toolbar = ({ children, className }) => (
  <div className={cn('flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between', className)}>
    {children}
  </div>
);

export const ToolbarGroup = ({ children, className }) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
);
