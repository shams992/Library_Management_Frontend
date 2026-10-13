import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, MoreHorizontal, Pencil, Plus, Receipt, Search, Trash2, TrendingDown } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Toolbar, ToolbarGroup } from '../../components/common/Toolbar.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { ConfirmDialog } from '../../components/ui/confirm-dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';
import { CategoryDonut } from '../../components/charts/index.js';
import { expenseService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { EXPENSE_CATEGORIES } from '../../utils/constants.js';
import { currentPeriod, formatDate, formatMoney, formatNumber, periodOptions, periodToLabel } from '../../utils/format.js';
import { ExpenseFormDialog } from '../../components/finance/ExpenseFormDialog.jsx';

export default function ExpensesPage() {
  const currency = useCurrency();
  const periods = useMemo(() => periodOptions(18), []);
  const [period, setPeriod] = useState(currentPeriod());
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['expenses', { period, category, search: debouncedSearch, page, limit }],
    queryFn: () => expenseService.list({ period, category, search: debouncedSearch, page, limit }),
    keepPreviousData: true,
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['expenses', 'summary', period],
    queryFn: () => expenseService.summary({ period }),
  });

  const expenses = data?.data || [];
  const meta = data?.meta;
  const summary = summaryData?.data?.summary || {};
  const byCategory = summaryData?.data?.byCategory || [];

  const deleteMutation = useApiMutation({
    mutationFn: (id) => expenseService.remove(id),
    invalidate: ['expenses', 'finance', 'dashboard'],
    successMessage: 'Expense deleted',
    onSuccess: () => { setDeleteTarget(null); refetch(); },
  });

  const columns = [
    { key: 'title', label: 'Expense', render: (row) => (
      <div className="text-sm">
        <p className="font-medium">{row.title}</p>
        {row.note ? <p className="line-clamp-1 text-xs text-muted-foreground">{row.note}</p> : null}
      </div>
    ) },
    { key: 'category', label: 'Category', render: (row) => (
      <Badge tone="muted">{EXPENSE_CATEGORIES.find((c) => c.value === row.category)?.label || row.category}</Badge>
    ) },
    { key: 'date', label: 'Date', render: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.date)}</span> },
    { key: 'method', label: 'Paid via', render: (row) => <span className="text-xs text-muted-foreground">{row.method?.replace('_', ' ') || '—'}</span> },
    { key: 'receipt', label: 'Receipt', render: (row) => (row.receipt?.url ? <Badge tone="success">Attached</Badge> : <span className="text-xs text-muted-foreground">—</span>) },
    { key: 'amount', label: 'Amount', align: 'right', render: (row) => <span className="font-medium text-destructive">{formatMoney(row.amount, currency)}</span> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.title}`}><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditTarget(row); setFormOpen(true); }}>
              <Pencil className="h-3.5 w-3.5" /> Edit expense
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(row)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Rent, utilities, maintenance, supplies — every cost of running your library, in one ledger."
        actions={
          <>
            <Button variant="outline" onClick={() => expenseService.exportCsv({ period })} className="hidden sm:inline-flex">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" /> Add expense
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Total — ${periodToLabel(period, { short: true })}`}
          value={formatMoney(summary.total, currency, { compact: true })}
          hint={`${formatNumber(summary.count)} expense(s)`}
          icon={TrendingDown}
          tone="destructive"
          loading={summaryLoading}
        />
        <StatCard
          label="Largest category"
          value={byCategory[0] ? EXPENSE_CATEGORIES.find((c) => c.value === byCategory[0].category)?.label || byCategory[0].category : '—'}
          hint={byCategory[0] ? formatMoney(byCategory[0].total, currency) : 'No expenses yet'}
          icon={Receipt}
          tone="warning"
          loading={summaryLoading}
        />
        <StatCard
          label="Average expense"
          value={formatMoney(summary.average, currency, { compact: true })}
          tone="info"
          loading={summaryLoading}
        />
        <StatCard
          label="Categories used"
          value={formatNumber(byCategory.length)}
          hint="Diversified costs are easier to cut"
          tone="primary"
          loading={summaryLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Where the money goes</CardTitle>
            <CardDescription>{periodToLabel(period)}</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="skeleton h-[260px] rounded-xl" />
            ) : byCategory.length ? (
              <CategoryDonut
                data={byCategory.map((row) => ({
                  name: EXPENSE_CATEGORIES.find((c) => c.value === row.category)?.label || row.category,
                  value: row.total,
                }))}
                nameKey="name"
                valueKey="value"
                height={260}
              />
            ) : (
              <EmptyState compact illustration="finance" title="No expenses recorded" description="Add your first expense to see the breakdown." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Expense ledger</CardTitle>
              <CardDescription>{isLoading ? 'Loading…' : `${formatNumber(meta?.total ?? 0)} record(s)`}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search expense…"
                  className="w-full pl-9 sm:w-48"
                  aria-label="Search expenses"
                />
              </div>
              <Select value={period} onValueChange={(value) => { setPeriod(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px]" aria-label="Month"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {periods.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={(value) => { setCategory(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[170px]" aria-label="Category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <DataTable
              columns={columns}
              rows={expenses}
              loading={isLoading}
              emptyState={
                <EmptyState
                  illustration="finance"
                  title={search || category !== 'all' ? 'No expenses match these filters' : `No expenses for ${periodToLabel(period)}`}
                  description="Record rent, bills, repairs and supplies so your profit figures reflect reality."
                  action={
                    search || category !== 'all' ? (
                      <Button variant="outline" onClick={() => { setSearch(''); setCategory('all'); }}>Clear filters</Button>
                    ) : (
                      <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add expense</Button>
                    )
                  }
                />
              }
              mobileCard={(row) => (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{row.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {EXPENSE_CATEGORIES.find((c) => c.value === row.category)?.label || row.category} · {formatDate(row.date)}
                    </p>
                  </div>
                  <span className="font-medium text-destructive">{formatMoney(row.amount, currency)}</span>
                </div>
              )}
            />

            {expenses.length ? <Pagination meta={meta} entity="expenses" onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} /> : null}
          </CardContent>
        </Card>
      </div>

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTarget(null); }}
        expense={editTarget}
        onDone={() => refetch()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Delete “${deleteTarget?.title || ''}”?`}
        description="This removes the expense from your ledger and from profit calculations. This cannot be undone."
        confirmLabel="Delete expense"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
