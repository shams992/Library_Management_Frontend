import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Switch } from '../../components/ui/misc.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { settingsService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';

/** Platform pricing + billing automation. Changes apply to new and renewing libraries. */
export default function BillingControlsPage() {
  const [form, setForm] = useState(null);
  const [sweepResult, setSweepResult] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: () => settingsService.admin(),
  });

  const settings = data?.data?.settings || data?.data;

  useEffect(() => {
    if (settings?.subscription) {
      setForm({
        ...settings.subscription,
        registration: { ...(settings.registration || {}) },
      });
    }
  }, [settings]);

  const saveMutation = useApiMutation({
    mutationFn: (payload) => settingsService.update({ subscription: payload.subscription }),
    invalidate: ['settings', 'admin', 'library'],
    successMessage: 'Billing settings saved',
    onSuccess: () => refetch(),
  });

  const sweepMutation = useApiMutation({
    mutationFn: (dryRun) => settingsService.billingSweep({ dryRun }),
    invalidate: ['libraries', 'admin', 'settings'],
    onSuccess: (response) => setSweepResult({ dryRun: false, ...response?.data }),
  });

  const previewMutation = useApiMutation({
    mutationFn: () => settingsService.billingSweep({ dryRun: true }),
    onSuccess: (response) => setSweepResult({ dryRun: true, ...response?.data }),
  });

  if (isLoading || !form) return <LoadingBlock label="Loading billing settings…" className="min-h-[50vh]" />;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing controls"
        description="Trial length, monthly price, grace period and the automated billing sweep."
        actions={
          <Button
            onClick={() =>
              saveMutation.mutate({
                subscription: {
                  trialMonths: form.trialMonths,
                  registrationFee: form.registrationFee,
                  priceMonthly: form.priceMonthly,
                  priceYearly: form.priceYearly,
                  gracePeriodDays: form.gracePeriodDays,
                  billingCycleMonths: form.billingCycleMonths,
                  autoSuspendEnabled: form.autoSuspendEnabled,
                  currency: form.currency,
                  currencySymbol: form.currencySymbol,
                },
              })
            }
            loading={saveMutation.isPending}
          >
            <Save className="h-4 w-4" /> Save billing settings
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Plans &amp; pricing</CardTitle>
            <CardDescription>What every new library is offered after its free trial</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Free trial length (months)" htmlFor="bc-trial" hint="Applied when a library is approved.">
              <Input id="bc-trial" type="number" min={0} max={12} value={form.trialMonths ?? 1} onChange={(e) => update('trialMonths', Number(e.target.value))} />
            </Field>
            <Field label="Registration fee (one-time)" htmlFor="bc-reg" hint="Rs. 2,000 one-time fee upon registration.">
              <Input id="bc-reg" type="number" min={0} value={form.registrationFee ?? 2000} onChange={(e) => update('registrationFee', Number(e.target.value))} />
            </Field>
            <Field label="Billing cycle (months)" htmlFor="bc-cycle" hint="1 = monthly billing.">
              <Input id="bc-cycle" type="number" min={1} max={12} value={form.billingCycleMonths ?? 1} onChange={(e) => update('billingCycleMonths', Number(e.target.value))} />
            </Field>
            <Field label="Monthly price" htmlFor="bc-monthly" hint="Rs. 1,000 is the default for this platform.">
              <Input id="bc-monthly" type="number" min={0} value={form.priceMonthly ?? 0} onChange={(e) => update('priceMonthly', Number(e.target.value))} />
            </Field>
            <Field label="Yearly price" htmlFor="bc-yearly" hint="Optional discounted annual price.">
              <Input id="bc-yearly" type="number" min={0} value={form.priceYearly ?? 0} onChange={(e) => update('priceYearly', Number(e.target.value))} />
            </Field>
            <Field label="Grace period (days)" htmlFor="bc-grace" hint="Days after a missed payment before access pauses.">
              <Input id="bc-grace" type="number" min={0} max={60} value={form.gracePeriodDays ?? 7} onChange={(e) => update('gracePeriodDays', Number(e.target.value))} />
            </Field>
            <Field label="Currency symbol" htmlFor="bc-symbol">
              <Input id="bc-symbol" value={form.currencySymbol || 'Rs.'} onChange={(e) => update('currencySymbol', e.target.value)} />
            </Field>

            <label className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5 sm:col-span-2">
              <span className="text-sm">
                <span className="block font-medium">Automatic suspension</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Suspends access when a payment is overdue beyond the grace period. Data is always preserved.
                </span>
              </span>
              <Switch checked={Boolean(form.autoSuspendEnabled)} onCheckedChange={(value) => update('autoSuspendEnabled', value)} aria-label="Automatic suspension" />
            </label>

            <Alert tone="info" icon className="sm:col-span-2">
              Changing the price does not change what existing libraries already pay — their agreed amount stays on their
              subscription record until you update it.
            </Alert>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Billing sweep</CardTitle>
              <CardDescription>Move expired trials and overdue accounts forward</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The sweep checks every subscription: ended trials become “payment due”, and overdue accounts are suspended after
                the grace period (only when automatic suspension is on). It notifies each librarian in-app.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => previewMutation.mutate()} loading={previewMutation.isPending}>
                  Preview (no changes)
                </Button>
                <Button size="sm" onClick={() => sweepMutation.mutate(false)} loading={sweepMutation.isPending}>
                  <Zap className="h-4 w-4" /> Run billing sweep
                </Button>
              </div>

              {sweepResult ? (
                <div className="rounded-xl border border-border bg-muted/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{sweepResult.dryRun ? 'Preview result' : 'Sweep completed'}</p>
                    <Badge tone={sweepResult.dryRun ? 'info' : 'success'}>{sweepResult.dryRun ? 'No changes made' : 'Applied'}</Badge>
                  </div>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Trials checked</dt>
                      <dd className="font-medium">{sweepResult.trialsChecked ?? 0}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Moved to payment due</dt>
                      <dd className="font-medium">{sweepResult.movedToPaymentDue ?? 0}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Suspended for non-payment</dt>
                      <dd className="font-medium">{sweepResult.suspended ?? 0}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Notifications sent</dt>
                      <dd className="font-medium">{sweepResult.notified ?? 0}</dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Alert tone="warning" icon title="Suspension is reversible by design">
            Suspending a library never deletes students, fees, salaries or expenses — access returns the moment you restore it.
          </Alert>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Current effective settings</CardTitle>
          <CardDescription>What libraries see right now on the landing page and in their dashboards</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setting</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ['Free trial', `${settings?.subscription?.trialMonths ?? 1} month${(settings?.subscription?.trialMonths ?? 1) === 1 ? '' : 's'}`],
                ['Registration fee (one-time)', `${settings?.subscription?.currencySymbol || 'Rs.'} ${(settings?.subscription?.registrationFee ?? 2000).toLocaleString('en-PK')}`],
                ['Monthly price', `${settings?.subscription?.currencySymbol || 'Rs.'} ${(settings?.subscription?.priceMonthly ?? 0).toLocaleString('en-PK')}`],
                ['Yearly price', settings?.subscription?.priceYearly ? `${settings.subscription.currencySymbol || 'Rs.'} ${settings.subscription.priceYearly.toLocaleString('en-PK')}` : 'Not offered'],
                ['Grace period', `${settings?.subscription?.gracePeriodDays ?? 7} days`],
                ['Automatic suspension', settings?.subscription?.autoSuspendEnabled ? 'Enabled' : 'Disabled'],
                ['Approval required', settings?.registration?.requireAdminApproval ? 'Yes' : 'No (auto-approve)'],
              ].map(([label, value]) => (
                <TableRow key={label}>
                  <TableCell className="text-muted-foreground">{label}</TableCell>
                  <TableCell className="text-right font-medium">{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
