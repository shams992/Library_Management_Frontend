import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Armchair, Layers, Plus, UserMinus, UserRound, Wrench } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input, Textarea } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert } from '../ui/feedback.jsx';
import { seatService, studentService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';

const singleSchema = z.object({
  mode: z.literal('single'),
  number: z.string().trim().min(1, 'Seat number is required').max(12),
  zone: z.string().trim().min(1, 'Zone is required').max(60),
  floor: z.coerce.number().int().min(0).max(20),
  status: z.enum(['available', 'reserved', 'maintenance']),
  monthlyFeeOverride: z.union([z.coerce.number().min(0).max(1000000), z.literal('')]).optional(),
  notes: z.string().trim().max(200).optional(),
});

const bulkSchema = z.object({
  mode: z.literal('bulk'),
  count: z.coerce.number().int().min(1, 'How many seats?').max(500),
  startNumber: z.coerce.number().int().min(0).max(9999),
  prefix: z.string().trim().max(6).optional(),
  zone: z.string().trim().min(1, 'Zone is required').max(60),
});

const schema = z.discriminatedUnion('mode', [singleSchema, bulkSchema]);

/**
 * Create one seat, bulk-generate a numbered row, or edit an existing seat.
 * Bulk mode is what makes onboarding a 60-seat reading room a 10-second job.
 */
export const SeatFormDialog = ({ open, onOpenChange, seat = null, onDone }) => {
  const isEdit = Boolean(seat);
  const [mode, setMode] = useState('single');

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { mode: 'single', number: '', zone: 'Main Hall', floor: 0, status: 'available', monthlyFeeOverride: '', notes: '' },
  });

  useEffect(() => {
    if (!open) return;
    if (seat) {
      setMode('single');
      reset({
        mode: 'single',
        number: seat.number || '',
        zone: seat.zone || 'Main Hall',
        floor: Number(seat.floor) || 0,
        status: seat.status === 'occupied' ? 'available' : seat.status || 'available',
        monthlyFeeOverride: seat.monthlyFeeOverride ?? '',
        notes: seat.notes || '',
      });
    } else {
      setMode('single');
      reset({ mode: 'single', number: '', zone: 'Main Hall', floor: 0, status: 'available', monthlyFeeOverride: '', notes: '' });
    }
  }, [open, seat, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => {
      if (isEdit) {
        const { mode: _mode, ...payload } = values;
        return seatService.update(seat.id, { ...payload, monthlyFeeOverride: payload.monthlyFeeOverride === '' ? null : payload.monthlyFeeOverride });
      }
      if (values.mode === 'bulk') {
        const { mode: _mode, ...payload } = values;
        return seatService.create(payload);
      }
      const { mode: _mode, ...payload } = values;
      return seatService.create(payload);
    },
    invalidate: ['seats', 'dashboard', 'library'],
    successMessage: isEdit ? 'Seat updated' : undefined,
    onSuccess: () => { onOpenChange(false); onDone?.(); },
  });

  const switchMode = (next) => {
    setMode(next);
    reset(
      next === 'bulk'
        ? { mode: 'bulk', count: 20, startNumber: 1, prefix: '', zone: 'Main Hall' }
        : { mode: 'single', number: '', zone: 'Main Hall', floor: 0, status: 'available', monthlyFeeOverride: '', notes: '' }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit seat ${seat?.number}` : 'Add seats'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Rename the seat, move it to another zone or take it out of service.'
              : 'Create a single seat, or generate a whole numbered row in one go.'}
          </DialogDescription>
        </DialogHeader>

        {!isEdit ? (
          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5" role="tablist" aria-label="Add mode">
            {[
              { value: 'single', label: 'Single seat', icon: Armchair },
              { value: 'bulk', label: 'Bulk generate', icon: Layers },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={mode === option.value}
                onClick={() => switchMode(option.value)}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === option.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <option.icon className="h-3.5 w-3.5" /> {option.label}
              </button>
            ))}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit((values) => mutation.mutate({ ...values, mode: isEdit ? 'single' : values.mode }))}
          noValidate
          className="space-y-4"
        >
          {mode === 'single' || isEdit ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Seat number" htmlFor="seat-number" required error={errors.number?.message}>
                <Input id="seat-number" {...register('number')} error={errors.number} placeholder="e.g. A-12 or 07" />
              </Field>
              <Field label="Zone / hall" htmlFor="seat-zone" required error={errors.zone?.message}>
                <Input id="seat-zone" {...register('zone')} error={errors.zone} placeholder="Main Hall, AC Room, Girls Hall" />
              </Field>
              <Field label="Floor" htmlFor="seat-floor" hint="0 = ground floor">
                <Input id="seat-floor" type="number" min={0} {...register('floor')} error={errors.floor} />
              </Field>
              <Field label="Status" htmlFor="seat-status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="seat-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field
                label="Fee override"
                htmlFor="seat-fee"
                className="sm:col-span-2"
                hint="Optional: charge a different monthly fee for this seat (e.g. AC seats). Leave blank to use the student’s own fee."
              >
                <Input id="seat-fee" type="number" min={0} {...register('monthlyFeeOverride')} placeholder="Leave blank" />
              </Field>
              <Field label="Notes" htmlFor="seat-notes" className="sm:col-span-2">
                <Textarea id="seat-notes" rows={2} {...register('notes')} placeholder="e.g. Near window, single cabin" />
              </Field>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="How many seats?" htmlFor="bulk-count" required error={errors.count?.message}>
                <Input id="bulk-count" type="number" min={1} max={500} {...register('count')} error={errors.count} />
              </Field>
              <Field label="Start numbering from" htmlFor="bulk-start" error={errors.startNumber?.message}>
                <Input id="bulk-start" type="number" min={0} {...register('startNumber')} error={errors.startNumber} />
              </Field>
              <Field label="Number prefix" htmlFor="bulk-prefix" hint="Example: A with start 1 → A01, A02, A03…">
                <Input id="bulk-prefix" {...register('prefix')} placeholder="Optional, e.g. A-" />
              </Field>
              <Field label="Zone / hall" htmlFor="bulk-zone" required error={errors.zone?.message}>
                <Input id="bulk-zone" {...register('zone')} error={errors.zone} />
              </Field>
              <Alert tone="info" icon className="sm:col-span-2">
                Seat numbers that already exist are skipped automatically, so you can safely generate in batches.
              </Alert>
            </div>
          )}

          {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? <Wrench className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isEdit ? 'Save seat' : mode === 'bulk' ? 'Generate seats' : 'Add seat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const assignSchema = z.object({
  studentId: z.string().min(1, 'Choose a student to assign'),
});

/**
 * Assign / release the student sitting on a seat. Usage is billed from the
 * student’s own monthly fee unless the seat carries a fee override.
 */
export const SeatAssignDialog = ({ seat, open, onOpenChange, onDone }) => {
  const assigned = Boolean(seat && (seat.status === 'occupied' || seat.occupiedBy || seat.studentId || seat.student));

  const { data } = useQuery({
    queryKey: ['students', 'assignable'],
    queryFn: () => studentService.list({ status: 'active', limit: 100, unseated: 'true' }),
    enabled: open && !assigned,
  });

  const { handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(assignSchema),
    defaultValues: { studentId: '' },
  });

  useEffect(() => { if (open) reset({ studentId: '' }); }, [open, reset]);

  const assignMutation = useApiMutation({
    mutationFn: (studentId) => seatService.update(seat.id, { studentId }),
    invalidate: ['seats', 'students', 'dashboard', 'library'],
    successMessage: 'Seat assigned',
    onSuccess: () => { onOpenChange(false); onDone?.(); },
  });

  const releaseMutation = useApiMutation({
    mutationFn: () => seatService.update(seat.id, { studentId: null }),
    invalidate: ['seats', 'students', 'dashboard', 'library'],
    successMessage: 'Seat released',
    onSuccess: () => { onOpenChange(false); onDone?.(); },
  });

  const unseated = data?.data || [];

  if (!seat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seat {seat.number}</DialogTitle>
          <DialogDescription>
            {seat.zone || 'Main Hall'} · {assigned ? 'Currently assigned' : 'Currently free'}
          </DialogDescription>
        </DialogHeader>

        {assigned ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-warning/35 bg-warning/8 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-medium">
                <UserRound className="h-4 w-4 text-warning" />
                {seat.student?.name || 'A student is assigned to this seat'}
              </p>
              {seat.student ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {seat.student.code || '—'}
                  {seat.student.phone ? ` · ${seat.student.phone}` : ''}
                </p>
              ) : null}
              {seat.student?.id ? (
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <a href={`/librarian/students/${seat.student.id}`}>Open student profile</a>
                </Button>
              ) : null}
            </div>

            <Alert tone="info" icon>
              Releasing the seat does not affect billing or the student record — it only frees the seat for someone else.
            </Alert>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button variant="destructive" loading={releaseMutation.isPending} onClick={() => releaseMutation.mutate()}>
                <UserMinus className="h-4 w-4" /> Release seat
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit((values) => assignMutation.mutate(values.studentId))} noValidate className="space-y-4">
            <Field label="Student" htmlFor="assign-student" required error={errors.studentId?.message} hint={`${unseated.length} active students without a seat`}>
              <Controller
                control={control}
                name="studentId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="assign-student"><SelectValue placeholder="Choose a student" /></SelectTrigger>
                    <SelectContent>
                      {unseated.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.fullName} · {student.studentCode || student.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {!unseated.length ? (
              <Alert tone="warning" icon>
                Every active student already has a seat. Add a student first, or release a seat elsewhere.
              </Alert>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" loading={assignMutation.isPending} disabled={!unseated.length}>
                <Armchair className="h-4 w-4" /> Assign seat
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
