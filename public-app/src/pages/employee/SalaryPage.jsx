import { useQuery } from '@tanstack/react-query';
import { Banknote, CheckCircle2, Receipt, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { LoadingBlock } from '../../components/ui/feedback.jsx';
import { PAYMENT_METHODS } from '../../utils/constants.js';
import { portalService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney, formatNumber, periodToLabel } from '../../utils/format.js';

/** "My salary": payslip-per-month history with every payment recorded. */
export default function EmployeeSalaryPage() {
  const currency = useCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'employee', 'salaries'],
    queryFn: () => portalService.employeeSalaries(),
  });

  const salaries = data?.data?.salaries || [];
  const totals = data?.data?.totals || {};

  return (
    <div className="space-y-6">
      <PageHeader title="My salary" description="Every month your library generated a salary record, and what has been paid." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total paid" value={formatMoney(totals.totalPaid, currency, { compact: true })} hint={`${formatNumber(totals.paymentCount)} payment(s)`} icon={CheckCircle2} tone="success" loading={isLoading} />
        <StatCard label="Total earned" value={formatMoney(totals.totalNet, currency, { compact: true })} hint={`${formatNumber(salaries.length)} month(s)`} icon={Wallet} tone="primary" loading={isLoading} />
        <StatCard label="Pending" value={formatMoney(totals.totalPending, currency, { compact: true })} icon={Receipt} tone={totals.totalPending > 0 ? 'warning' : 'default'} loading={isLoading} />
        <StatCard label="Average per month" value={formatMoney(totals.average, currency, { compact: true })} icon={Banknote} tone="info" loading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary history</CardTitle>
          <CardDescription>Newest month first</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingBlock label="Loading your salary records…" />
          ) : salaries.length === 0 ? (
            <EmptyState
              illustration="employees"
              title="No salary records yet"
              description="Your library generates salaries each month — they will appear here as soon as the first one is created."
            />
          ) : (
            <ul className="space-y-4">
              {salaries.map((salary) => (
                <li key={salary.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{periodToLabel(salary.periodKey)}</p>
                      <p className="text-xs text-muted-foreground">
                        Base {formatMoney(salary.amount, currency)}
                        {salary.bonus ? ` · bonus ${formatMoney(salary.bonus, currency)}` : ''}
                        {salary.deduction ? ` · deduction ${formatMoney(salary.deduction, currency)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatMoney(salary.netAmount, currency)}</p>
                        <p className="text-xs text-muted-foreground">paid {formatMoney(salary.paidAmount, currency)}</p>
                      </div>
                      <StatusBadge status={salary.status} kind="salary" />
                    </div>
                  </div>

                  {salary.payments?.length ? (
                    <ul className="mt-3 space-y-1.5 rounded-lg bg-muted/50 p-3">
                      {salary.payments.map((payment) => (
                        <li key={payment.id || `${payment.paidAt}-${payment.amount}`} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {formatDate(payment.paidAt)} · {PAYMENT_METHODS.find((m) => m.value === payment.method)?.label || 'Cash'}
                            {payment.reference ? ` · ${payment.reference}` : ''}
                          </span>
                          <span className="font-medium text-success">{formatMoney(payment.amount, currency)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">No payment recorded for this month yet.</p>
                  )}

                  {salary.notes ? <p className="mt-2 text-xs text-muted-foreground">Note: {salary.notes}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium">How your salary is worked out</p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <li>• Net salary = base salary + bonus − deduction.</li>
            <li>• Payments are recorded by the librarian, full or partial.</li>
            <li>• Salary is paid directly by your library — this portal is the record.</li>
            <li>• Attendance marked each month is available on the attendance page.</li>
          </ul>
          <Badge tone="muted" className="mt-3">Questions? Speak to your librarian</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
