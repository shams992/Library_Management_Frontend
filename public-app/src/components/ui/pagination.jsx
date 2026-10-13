import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.jsx';
import { cn } from '../../utils/cn.js';

export const Pagination = ({ meta, onPageChange, onLimitChange, className, limitOptions = [10, 20, 50, 100], entity = 'records' }) => {
  if (!meta) return null;
  const { page = 1, limit = 20, total = 0, totalPages = 1, hasNext, hasPrev } = meta;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={cn('flex flex-col gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between', className)}>
      <p className="text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span> {entity}
      </p>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        {onLimitChange ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">Rows</span>
            <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
              <SelectTrigger className="h-8 w-[74px] text-xs" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={!hasPrev && page <= 1} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[74px] text-center text-xs text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={!hasNext && page >= totalPages} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
