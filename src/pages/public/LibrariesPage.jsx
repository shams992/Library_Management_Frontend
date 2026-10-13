import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Clock, LayoutGrid, MapPin, Search, Users } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Card } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { Skeleton } from '../../components/ui/misc.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { SectionHeading } from '../../components/common/SectionHeading.jsx';
import { libraryService } from '../../services/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useQueryParams } from '../../hooks/useQueryParams.js';
import { LIBRARY_TYPES } from '../../utils/constants.js';
import { formatNumber } from '../../utils/format.js';
import { useSettings } from '../../hooks/useSettings.js';
import { ApplyDialog } from './LibraryDetailPage.jsx';

export const LibraryCard = ({ library, onApply }) => {
  const available = library.seats?.available ?? 0;
  const total = library.seats?.total ?? 0;
  const utilization = total ? Math.round(((library.seats?.occupied || 0) / total) * 100) : 0;

  return (
    <Card className="surface-hover flex h-full flex-col overflow-hidden">
      <div className="flex items-start gap-3 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {library.logo?.url ? (
            <img src={library.logo.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{library.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {library.city}{library.province ? `, ${library.province}` : ''}
          </p>
        </div>
        {library.isFeatured ? <Badge tone="info">Featured</Badge> : null}
      </div>

      {library.description ? (
        <p className="line-clamp-2 px-5 text-sm text-muted-foreground">{library.description}</p>
      ) : null}

      <dl className="mt-4 grid grid-cols-3 gap-2 px-5 text-center">
        <div className="rounded-lg bg-muted/60 p-2.5">
          <dt className="text-[0.62rem] uppercase tracking-wide text-muted-foreground">Total seats</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">{formatNumber(total)}</dd>
        </div>
        <div className="rounded-lg bg-success/10 p-2.5">
          <dt className="text-[0.62rem] uppercase tracking-wide text-muted-foreground">Available</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-success">{formatNumber(available)}</dd>
        </div>
        <div className="rounded-lg bg-muted/60 p-2.5">
          <dt className="text-[0.62rem] uppercase tracking-wide text-muted-foreground">Occupancy</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">{utilization}%</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {library.timings}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" aria-hidden="true" /> {formatNumber(library.students)} members
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" /> {LIBRARY_TYPES.find((t) => t.value === library.libraryType)?.label || 'Reading room'}
        </span>
      </div>

      <div className="mt-auto flex items-center gap-2 p-5 pt-5">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <Link to={`/libraries/${library.id}`}>View library</Link>
        </Button>
        <Button
          size="sm"
          className="flex-1"
          disabled={available <= 0}
          onClick={() => onApply(library)}
        >
          {available > 0 ? 'Apply' : 'Seats full'}
        </Button>
      </div>
    </Card>
  );
};

/**
 * Public library discovery — students search the directory, browse libraries
 * and open the application dialog (which posts to the real API).
 */
export default function LibrariesPage() {
  const { registration } = useSettings();
  const { params, setParams } = useQueryParams({ search: '', city: '', libraryType: '', sort: 'recommended', page: '1' });
  const [searchValue, setSearchValue] = useState(params.search || '');
  const debouncedSearch = useDebounce(searchValue, 400);
  const [applyTarget, setApplyTarget] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['libraries', 'public', { ...params, search: debouncedSearch }],
    queryFn: () => libraryService.list({ ...params, search: debouncedSearch, limit: 12 }),
    keepPreviousData: true,
    enabled: registration.allowPublicDiscovery,
  });

  const libraries = data?.data || [];
  const meta = data?.meta;
  const cities = meta?.cities || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        align="left"
        eyebrow="Library directory"
        title="Find a library near you"
        description="Browse registered private libraries, check seat availability and apply for membership online. Your application goes straight to the librarian's dashboard."
      />

      {!registration.allowPublicDiscovery ? (
        <EmptyState
          className="mt-10"
          illustration="search"
          title="Library discovery is currently disabled"
          description="Platform administration has turned off the public library directory. Please try again later."
        />
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={searchValue}
                onChange={(e) => { setSearchValue(e.target.value); setParams({ search: e.target.value, page: 1 }); }}
                placeholder="Search by library name, area or city…"
                className="pl-9"
                aria-label="Search libraries"
              />
            </div>

            <Select value={params.city || 'all'} onValueChange={(value) => setParams({ city: value === 'all' ? '' : value, page: 1 })}>
              <SelectTrigger className="lg:w-48" aria-label="Filter by city">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={params.libraryType || 'all'} onValueChange={(value) => setParams({ libraryType: value === 'all' ? '' : value, page: 1 })}>
              <SelectTrigger className="lg:w-52" aria-label="Filter by library type">
                <SelectValue placeholder="All library types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All library types</SelectItem>
                {LIBRARY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={params.sort || 'recommended'} onValueChange={(value) => setParams({ sort: value, page: 1 })}>
              <SelectTrigger className="lg:w-44" aria-label="Sort libraries">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
                <SelectItem value="seats">Most seats</SelectItem>
                <SelectItem value="available">Most available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[320px] rounded-xl" />)}
            </div>
          ) : libraries.length === 0 ? (
            <EmptyState
              className="mt-10"
              illustration="search"
              title={searchValue ? `No libraries match “${searchValue}”` : 'No libraries are listed yet'}
              description={
                searchValue
                  ? 'Try a different name, area or clear your filters.'
                  : 'Libraries appear here as soon as they are approved. If you own a library, register it to be listed.'
              }
              action={<Button asChild><Link to="/register">Register your library</Link></Button>}
              secondaryAction={searchValue ? <Button variant="outline" onClick={() => { setSearchValue(''); setParams({ search: '', city: '', libraryType: '' }); }}>Clear filters</Button> : null}
            />
          ) : (
            <>
              <div className={`mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-70 transition-opacity' : ''}`}>
                {libraries.map((library) => (
                  <LibraryCard key={library.id} library={library} onApply={setApplyTarget} />
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
                <Pagination
                  meta={meta}
                  entity="libraries"
                  onPageChange={(page) => setParams({ page })}
                />
              </div>
            </>
          )}
        </>
      )}

      <ApplyDialog
        library={applyTarget}
        open={Boolean(applyTarget)}
        onOpenChange={(open) => { if (!open) setApplyTarget(null); }}
      />
    </div>
  );
}
