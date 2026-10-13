import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Clock, Image as ImageIcon, Save, ShieldCheck, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input, Textarea } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Switch } from '../../components/ui/misc.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { libraryService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { LIBRARY_TYPES } from '../../utils/constants.js';
import { useAuth } from '../../hooks/useAuth.js';

const FACILITIES = [
  { key: 'airConditioned', label: 'Air conditioned' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'lockers', label: 'Lockers' },
  { key: 'separateGirlsHall', label: 'Separate girls hall' },
  { key: 'cctv', label: 'CCTV' },
  { key: 'generator', label: 'Backup power' },
  { key: 'drinkingWater', label: 'Drinking water' },
  { key: 'washroom', label: 'Washrooms' },
];

/** Library profile: the details students see in the public directory. */
export default function LibrarySettingsPage() {
  const { refresh } = useAuth();
  const [form, setForm] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['library', 'mine'],
    queryFn: () => libraryService.mine(),
  });

  const library = data?.data?.library || data?.data;

  useEffect(() => {
    if (library) {
      setForm({
        name: library.name || '',
        description: library.description || '',
        libraryType: library.libraryType || 'reading_room',
        address: library.address || '',
        city: library.city || '',
        province: library.province || '',
        phone: library.phone || '',
        email: library.email || '',
        website: library.website || '',
        openingTime: library.openingTime || '08:00',
        closingTime: library.closingTime || '22:00',
        seatCapacity: library.seatCapacity ?? library.totalSeats ?? 0,
        facilities: Array.isArray(library.facilities) ? [...library.facilities] : [],
        isPubliclyListed: library.isPubliclyListed !== false,
      });
    }
  }, [library]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleFacility = (key) =>
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(key)
        ? prev.facilities.filter((item) => item !== key)
        : [...prev.facilities, key],
    }));

  const mutation = useApiMutation({
    mutationFn: (payload) => libraryService.updateMine(payload),
    invalidate: ['library', 'dashboard'],
    successMessage: 'Library details saved',
    onSuccess: () => { refetch(); refresh?.(); },
  });

  const logoMutation = useApiMutation({
    mutationFn: (file) => libraryService.uploadLogo(file),
    invalidate: ['library', 'dashboard'],
    successMessage: 'Logo updated',
    onSuccess: () => refetch(),
  });

  if (isLoading || !form) return <LoadingBlock label="Loading library profile…" className="min-h-[50vh]" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library settings"
        description="Your library identity, timings and facilities — used across the platform and in the public directory."
        actions={
          <Button onClick={() => mutation.mutate(form)} loading={mutation.isPending}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Identity</CardTitle>
              <CardDescription>Name, type and description shown to students</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Library name" htmlFor="ls-name" required className="sm:col-span-2">
                <Input id="ls-name" value={form.name} onChange={(e) => update('name', e.target.value)} />
              </Field>
              <Field label="Library type" htmlFor="ls-type">
                <Select value={form.libraryType} onValueChange={(value) => update('libraryType', value)}>
                  <SelectTrigger id="ls-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LIBRARY_TYPES.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Seat capacity" htmlFor="ls-capacity" hint="Total seats you offer students">
                <Input id="ls-capacity" type="number" min={0} value={form.seatCapacity} onChange={(e) => update('seatCapacity', Number(e.target.value))} />
              </Field>
              <Field label="About your library" htmlFor="ls-desc" className="sm:col-span-2" hint="A short, honest description works best.">
                <Textarea id="ls-desc" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact &amp; location</CardTitle>
              <CardDescription>How students and parents reach you</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="ls-phone">
                <Input id="ls-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} inputMode="tel" />
              </Field>
              <Field label="Email" htmlFor="ls-email">
                <Input id="ls-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </Field>
              <Field label="Website" htmlFor="ls-website" hint="Optional">
                <Input id="ls-website" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://" />
              </Field>
              <Field label="Province / state" htmlFor="ls-province">
                <Input id="ls-province" value={form.province} onChange={(e) => update('province', e.target.value)} />
              </Field>
              <Field label="Address" htmlFor="ls-address" className="sm:col-span-2">
                <Input id="ls-address" value={form.address} onChange={(e) => update('address', e.target.value)} />
              </Field>
              <Field label="City" htmlFor="ls-city">
                <Input id="ls-city" value={form.city} onChange={(e) => update('city', e.target.value)} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Opening hours</CardTitle>
              <CardDescription>Shown on your public profile</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Opens at" htmlFor="ls-open">
                <Input id="ls-open" type="time" value={form.openingTime} onChange={(e) => update('openingTime', e.target.value)} />
              </Field>
              <Field label="Closes at" htmlFor="ls-close">
                <Input id="ls-close" type="time" value={form.closingTime} onChange={(e) => update('closingTime', e.target.value)} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
              <CardDescription>Tick everything you offer — students filter by these</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {FACILITIES.map((facility) => (
                <label key={facility.key} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
                  <span className="text-sm">{facility.label}</span>
                  <Switch checked={form.facilities.includes(facility.key)} onCheckedChange={() => toggleFacility(facility.key)} aria-label={facility.label} />
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Logo</CardTitle>
              <CardDescription>Shown in your dashboard and public profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                {library?.logo?.url ? (
                  <img src={library.logo.url} alt={`${form.name} logo`} className="max-h-24 max-w-full object-contain" />
                ) : (
                  <span className="text-sm text-muted-foreground">No logo uploaded yet</span>
                )}
              </div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                <Upload className="h-4 w-4" />
                {logoMutation.isPending ? 'Uploading…' : 'Upload new logo'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      await logoMutation.mutateAsync(file);
                      toast.success('Logo updated');
                    } catch (error) {
                      toast.error(error.message || 'Could not upload the logo');
                    }
                  }}
                />
              </label>
              <p className="text-xs text-muted-foreground">PNG or JPG, up to 2 MB. A square logo looks best.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Visibility</CardTitle>
              <CardDescription>Control how students find you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
                <span className="text-sm">
                  <span className="block font-medium">List my library publicly</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Students can find you in the library directory and apply online.
                  </span>
                </span>
                <Switch checked={form.isPubliclyListed} onCheckedChange={(value) => update('isPubliclyListed', value)} aria-label="List my library publicly" />
              </label>

              <Alert tone="info" icon>
                Your data is private either way — platform administration and your own staff are the only people with access to
                student and fee records.
              </Alert>

              <div className="flex flex-wrap gap-2">
                <Badge tone="muted">Status: {library?.status || '—'}</Badge>
                <Badge tone="muted">Seats: {library?.stats?.totalSeats ?? library?.totalSeats ?? 0}</Badge>
                <Badge tone="muted">Students: {library?.stats?.totalStudents ?? 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
