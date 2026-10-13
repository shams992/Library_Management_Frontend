import { Search, X } from 'lucide-react';
import { Input } from './input.jsx';
import { cn } from '../../utils/cn.js';

export const SearchInput = ({ value, onChange, placeholder = 'Search…', className, ...props }) => (
  <div className={cn('relative w-full sm:max-w-xs', className)}>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    <Input
      type="search"
      role="searchbox"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9 pr-9"
      {...props}
    />
    {value ? (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    ) : null}
  </div>
);
