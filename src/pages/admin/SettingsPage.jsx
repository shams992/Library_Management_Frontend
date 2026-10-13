import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Globe, Mail, Megaphone, Save, ShieldCheck, Wrench } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input, Textarea } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Switch } from '../../components/ui/misc.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { settingsService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useSettings } from '../../hooks/useSettings.js';

/** Platform settings: brand, registration rules, marketing copy and maintenance mode. */
export default function AdminSettingsPage() {
  const { refresh } = useSettings();
  const [form, setForm] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: () => settingsService.admin(),
  });

  const settings = data?.data?.settings || data?.data;

  useEffect(() => {
    if (settings) {
      setForm({
        brand: { ...(settings.brand || {}) },
        registration: { ...(settings.registration || {}) },
        marketing: { ...(settings.marketing || {}) },
        maintenance: { ...(settings.maintenance || {}) },
      });
    }
  }, [settings]);

  const mutation = useApiMutation({
    mutationFn: (payload) => settingsService.update(payload),
    invalidate: ['settings', 'admin'],
    successMessage: 'Platform settings saved',
    onSuccess: () => { refetch(); refresh?.(); },
  });

  if (isLoading || !form) return <LoadingBlock label="Loading platform settings…" className="min-h-[50vh]" />;

  const update = (section, key, value) => setForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform settings"
        description="Branding, registration rules, landing-page content and maintenance mode."
        actions={
          <Button onClick={() => mutation.mutate(form)} loading={mutation.isPending}>
            <Save className="h-4 w-4" /> Save settings
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Brand</CardTitle>
            <CardDescription>Shown across the platform, emails and the landing page</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Platform name" htmlFor="s-name">
              <Input id="s-name" value={form.brand.name || ''} onChange={(e) => update('brand', 'name', e.target.value)} />
            </Field>
            <Field label="Support email" htmlFor="s-email">
              <Input id="s-email" type="email" value={form.brand.supportEmail || ''} onChange={(e) => update('brand', 'supportEmail', e.target.value)} />
            </Field>
            <Field label="Support phone" htmlFor="s-phone">
              <Input id="s-phone" value={form.brand.supportPhone || ''} onChange={(e) => update('brand', 'supportPhone', e.target.value)} />
            </Field>
            <Field label="Office address" htmlFor="s-address">
              <Input id="s-address" value={form.brand.address || ''} onChange={(e) => update('brand', 'address', e.target.value)} />
            </Field>
            <Field label="Tagline" htmlFor="s-tagline" className="sm:col-span-2">
              <Input id="s-tagline" value={form.brand.tagline || ''} onChange={(e) => update('brand', 'tagline', e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Registration rules</CardTitle>
            <CardDescription>How new libraries join the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'requireAdminApproval', label: 'Require admin approval', hint: 'New libraries wait for your review before they get access.' },
              { key: 'allowPublicDiscovery', label: 'Public library directory', hint: 'Students can browse libraries and apply online.' },
            ].map((row) => (
              <label key={row.key} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
                <span className="text-sm">
                  <span className="block font-medium">{row.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{row.hint}</span>
                </span>
                <Switch
                  checked={Boolean(form.registration[row.key])}
                  onCheckedChange={(value) => update('registration', row.key, value)}
                  aria-label={row.label}
                />
              </label>
            ))}
            <Field label="Maximum students per library" htmlFor="s-max" hint="A safety limit — most libraries set this to their seat capacity.">
              <Input
                id="s-max"
                type="number"
                min={1}
                value={form.registration.maxStudentsPerLibrary || 1000}
                onChange={(e) => update('registration', 'maxStudentsPerLibrary', Number(e.target.value))}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Landing page</CardTitle>
            <CardDescription>What visitors see on the public site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
              <span className="text-sm">
                <span className="block font-medium">Show live platform stats</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Real library and student counts on the landing page. Turn off if those numbers are still small.
                </span>
              </span>
              <Switch checked={Boolean(form.marketing.showLiveStats)} onCheckedChange={(value) => update('marketing', 'showLiveStats', value)} aria-label="Show live stats" />
            </label>
            <label className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
              <span className="text-sm">
                <span className="block font-medium">Show testimonials</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Only enable once you have genuine customer quotes.</span>
              </span>
              <Switch checked={Boolean(form.marketing.showTestimonials)} onCheckedChange={(value) => update('marketing', 'showTestimonials', value)} aria-label="Show testimonials" />
            </label>
            <Field label="Support hours" htmlFor="s-hours">
              <Input id="s-hours" value={form.marketing.supportHours || ''} onChange={(e) => update('marketing', 'supportHours', e.target.value)} placeholder="Monday to Saturday, 10am – 7pm" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Maintenance mode</CardTitle>
            <CardDescription>Show a notice while you work on the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
              <span className="text-sm">
                <span className="block font-medium">Enable maintenance notice</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Libraries see your message but keep their data access.</span>
              </span>
              <Switch checked={Boolean(form.maintenance.enabled)} onCheckedChange={(value) => update('maintenance', 'enabled', value)} aria-label="Maintenance mode" />
            </label>
            <Field label="Notice message" htmlFor="s-maint-msg">
              <Textarea id="s-maint-msg" rows={3} value={form.maintenance.message || ''} onChange={(e) => update('maintenance', 'message', e.target.value)} placeholder="We are upgrading the platform tonight between 11pm and 1am." />
            </Field>

            <Alert tone="info" icon>
              Maintenance mode never blocks data access — it only displays a notice, so libraries can keep working through it.
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Settings are cached for a few minutes on the public site and refreshed automatically in every open dashboard after
            you save. Pricing and trial length live under <strong>Billing controls</strong>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Password reset links are shown in the console in this development environment. Connect an SMTP provider in
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5">backend/.env</code> to deliver them by email in production.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
