import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.jsx';
import { Skeleton } from '../ui/misc.jsx';
import { EmptyState } from '../ui/empty-state.jsx';
import { cn } from '../../utils/cn.js';

/**
 * Responsive data table.
 *  • ≥ lg : real table with sticky header
 *  • < lg : the same rows rendered as touch-friendly cards (no horizontal scroll)
 */
export const DataTable = ({
  columns,
  rows,
  loading = false,
  skeletonRows = 5,
  emptyState,
  onRowClick,
  rowKey = (row, index) => row.id || index,
  mobileCard,
  className,
  footer,
}) => {
  if (loading) {
    return (
      <div className="table-shell">
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.headerClassName}>{col.label ?? col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}><Skeleton className="h-4 w-full max-w-[140px]" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-3 p-4 lg:hidden">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!rows?.length) {
    return emptyState || <EmptyState title="Nothing here yet" description="Records will appear here once they are created." />;
  }

  return (
    <div className={cn('table-shell', className)}>
      {/* Desktop */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={cn(col.align === 'right' && 'text-right', col.headerClassName)}>
                  {col.label ?? col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn(col.align === 'right' && 'text-right', col.cellClassName)}>
                    {col.render ? col.render(row, index) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-border lg:hidden">
        {rows.map((row, index) => (
          <div
            key={rowKey(row, index)}
            className={cn('p-4', onRowClick && 'cursor-pointer active:bg-muted/60')}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            role={onRowClick ? 'button' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(row); } : undefined}
          >
            {mobileCard ? mobileCard(row, index) : (
              <div className="space-y-2">
                {columns.slice(0, 4).map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{col.label ?? col.header}</span>
                    <span className="text-right">{col.render ? col.render(row, index) : row[col.key]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {footer}
    </div>
  );
};
