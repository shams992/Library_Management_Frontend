import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Building2, Clock, LayoutGrid, Mail, MapPin, Phone, ShieldCheck, Sparkles, Users, Wifi,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button.jsx';
import { Card } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input, Textarea } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { libraryService } from '../../services/index.js';
import { LIBRARY_TYPES } from '../../utils/constants.js';
import { formatDate, formatMoney } from '../../utils/format.js';
import { useSettings } from '../../hooks/useSettings.js';
import { useAuth } from '../../hooks/useAuth.js';

const applySchema = z.object({
  fullName: z.string().trim().min(3, 'Please enter your full name').max(120),
  fatherName: z.string().trim().max(120).optional().nullable().or(z.literal('')),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(20),
  email: z.union([z.string().trim().email('Enter a valid email'), z.literal(''), z.null()]).optional(),
  cnic: z.string().trim().max(30).optional().nullable().or(z.literal('')),
  address: z.string().trim().max(300).optional().nullable().or(z.literal('')),
  preferredShift: z.enum(['morning', 'evening', 'full_day']).default('full_day'),
});

/** Public application form — creates a PENDING student record for the librarian to approve. */
export const ApplyDialog = ({ library, open, onOpenChange }) => {
  const [reference, setReference] = useState(null);
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(applySchema),
    defaultValues: { preferredShift: 'full_day' },
  });

  useEffect(() => {
    if (open && user) {
      reset({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        preferredShift: 'full_day',
      });
    }
  }, [open, user, reset]);

  const mutation = useMutation({
    mutationFn: (values) => libraryService.apply(library.id, values),
    onSuccess: (response) => {
      setReference(response.data);
      reset();
      toast.success('Application submitted. The librarian has been notified!');
    },
    onError: (error) => toast.error(error.message || 'Could not submit your application'),
  });

  const close = () => {
    setReference(null);
    onOpenChange(false);
  };

  if (!library) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : close())}>
      <DialogContent className="max-w-lg">
        {reference ? (
          <>
            <DialogHeader>
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-success/12">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <DialogTitle>Application submitted</DialogTitle>
              <DialogDescription>
                Your application to <strong>{library.name}</strong> was sent to the librarian. Note your reference number —
                the librarian will review your seat request.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Reference number</p>
              <p className="mt-1 font-mono text-base font-semibold">{reference.studentCode || reference.applicationId}</p>
              <p className="mt-2 text-xs text-muted-foreground">Status: pending librarian approval</p>
              <p className="mt-1 text-xs text-primary font-medium">Once approved by the librarian, your seat and fee schedule will automatically appear on your Student Dashboard.</p>
            </div>
            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form
            onSubmit={handleSubmit(
              (values) => mutation.mutate(values),
              (errs) => {
                const k = Object.keys(errs)[0];
                if (k) toast.error(errs[k]?.message || 'Please check the application form');
              }
            )}
            noValidate
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Apply to join {library.name}</DialogTitle>
              <DialogDescription>
                Send your details to the library. They will review your application and contact you to complete registration.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="apply-name" required error={errors.fullName?.message} className="sm:col-span-2">
                <Input id="apply-name" {...register('fullName')} error={errors.fullName} autoComplete="name" placeholder="e.g. Ahmed Khan" />
              </Field>
              <Field label="Father name" htmlFor="apply-father" error={errors.fatherName?.message}>
                <Input id="apply-father" {...register('fatherName')} placeholder="Optional" />
              </Field>
              <Field label="Phone" htmlFor="apply-phone" required error={errors.phone?.message}>
                <Input id="apply-phone" {...register('phone')} error={errors.phone} inputMode="tel" placeholder="03xx xxxxxxx" />
              </Field>
              <Field label="Email / Gmail" htmlFor="apply-email" error={errors.email?.message} hint="Used for student portal login">
                <Input id="apply-email" type="email" {...register('email')} error={errors.email} placeholder="student@gmail.com" />
              </Field>
              <Field label="CNIC / NIC" htmlFor="apply-cnic" error={errors.cnic?.message} hint="Used for passwordless login">
                <Input id="apply-cnic" {...register('cnic')} placeholder="e.g. 12345-1234567-1" />
              </Field>
              <Field label="Preferred shift" htmlFor="apply-shift">
                <Select defaultValue="full_day" onValueChange={(value) => register('preferredShift').onChange({ target: { value, name: 'preferredShift' } })}>
                  <SelectTrigger id="apply-shift"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="full_day">Full day</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Your area / address" htmlFor="apply-address" error={errors.address?.message} className="sm:col-span-2">
                <Textarea id="apply-address" rows={2} {...register('address')} placeholder="Optional — helps the library plan seating" />
              </Field>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>Cancel</Button>
              <Button type="submit" loading={mutation.isPending}>Submit application</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function LibraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applyOpen, setApplyOpen] = useState(false);
  const { subscription } = useSettings();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['libraries', 'public', id],
    queryFn: () => libraryService.detail(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <LoadingBlock label="Loading library…" className="min-h-[60vh]" />;

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          illustration="search"
          title="Library not available"
          description={error?.message || 'This library may not be open for applications right now.'}
          action={<Button onClick={() => navigate('/libraries')}>Browse all libraries</Button>}
        />
      </div>
    );
  }

  const library = data.data;
  const available = library.seats?.available ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-5">
        <Link to="/libraries"><ArrowLeft className="h-4 w-4" /> All libraries</Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 sm:h-40" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-sm">
                {library.logo?.url ? (
                  <img src={library.logo.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-semibold tracking-tight">{library.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {library.address}, {library.city}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {library.openingTime} – {library.closingTime}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <Badge tone={available > 0 ? 'success' : 'destructive'} dot>
                {available > 0 ? `${available} seats available` : 'No seats available'}
              </Badge>
              <Button onClick={() => setApplyOpen(true)} disabled={available <= 0}>
                {available > 0 ? 'Apply for a seat' : 'Seats full'}
              </Button>
            </div>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              {library.description ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">About this library</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{library.description}</p>
                </section>
              ) : null}

              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Seats</h2>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total', value: library.seats?.total || 0, tone: 'text-foreground' },
                    { label: 'Occupied', value: library.seats?.occupied || 0, tone: 'text-primary' },
                    { label: 'Available', value: available, tone: 'text-success' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-muted/40 p-3 text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                      <p className={`mt-1 text-lg font-semibold tabular-nums ${stat.tone}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {library.facilities?.length ? (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Facilities</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {library.facilities.map((facility) => (
                      <li key={facility}>
                        <Badge tone="neutral" size="sm"><Wifi className="h-3 w-3" /> {facility}</Badge>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold">Membership</h2>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Monthly fee</dt>
                    <dd className="font-medium">{library.monthlyFeeDefault ? formatMoney(library.monthlyFeeDefault, subscription) : 'Contact library'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Security deposit</dt>
                    <dd className="font-medium">{library.securityDepositDefault ? formatMoney(library.securityDepositDefault, subscription) : '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Library type</dt>
                    <dd className="font-medium">{LIBRARY_TYPES.find((t) => t.value === library.libraryType)?.label || 'Reading room'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Member since</dt>
                    <dd className="font-medium">{formatDate(library.createdAt)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold">Contact</h2>
                <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {library.phone}</li>
                  <li className="flex items-center gap-2 break-all"><Mail className="h-4 w-4" /> {library.email}</li>
                  <li className="flex items-center gap-2"><Users className="h-4 w-4" /> {library.students} members</li>
                  <li className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> {library.seats?.total || 0} seats</li>
                </ul>
              </div>

              <Alert tone="info" icon>
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <Sparkles className="h-4 w-4" /> Applications are reviewed by the library. You will be contacted on the phone number you provide.
                </span>
              </Alert>
            </aside>
          </div>
        </div>
      </Card>

      <ApplyDialog library={library} open={applyOpen} onOpenChange={setApplyOpen} />
    </div>
  );
}
