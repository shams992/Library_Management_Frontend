import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button.jsx';
import { Input, Textarea } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert } from '../ui/feedback.jsx';
import { studentService, seatService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { formatMoney } from '../../utils/format.js';
import { useCurrency } from '../../hooks/useSettings.js';

const schema = z.object({
  fullName: z.string().trim().min(3, 'Student name is required').max(120),
  fatherName: z.string().trim().max(120).optional(),
  cnic: z.string().trim().max(20).optional(),
  phone: z.string().trim().min(7, 'A contact number is required').max(20),
  email: z.union([z.string().trim().email('Enter a valid email'), z.literal('')]).optional(),
  address: z.string().trim().max(300).optional(),
  guardianPhone: z.string().trim().max(24).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  shift: z.enum(['morning', 'evening', 'full_day']),
  monthlyFee: z.coerce.number().min(0, 'Fee cannot be negative').max(1000000),
  securityDeposit: z.coerce.number().min(0).max(1000000),
  securityDepositPaid: z.boolean().optional(),
  seatId: z.string().optional(),
  registrationDate: z.string().optional(),
  status: z.enum(['pending', 'active', 'fee_due', 'suspended']),
  notes: z.string().trim().max(1000).optional(),
  createPortalLogin: z.boolean().optional(),
});

const EMPTY = {
  fullName: '', fatherName: '', cnic: '', phone: '', email: '', address: '', guardianPhone: '', gender: undefined,
  shift: 'full_day', monthlyFee: 3000, securityDeposit: 0, securityDepositPaid: false, seatId: '', registrationDate: '',
  status: 'active', notes: '', createPortalLogin: false,
};

/**
 * Create / edit a student. Seats are loaded from the API and only free seats
 * (plus the student's current seat) are offered, so clashes cannot be created here.
 */
export const StudentFormDialog = ({ open, onOpenChange, student = null }) => {
  const currency = useCurrency();
  const isEdit = Boolean(student);

  const { data: seatData } = useQuery({
    queryKey: ['seats', 'bookable'],
    queryFn: () => seatService.list({ bookable: 'true', limit: 100 }),
    enabled: open,
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      student
        ? {
            ...EMPTY,
            ...student,
            seatId: student.seatId || '',
            securityDepositPaid: Boolean(student.securityDepositPaid),
            registrationDate: student.registrationDate ? String(student.registrationDate).slice(0, 10) : '',
            createPortalLogin: false,
          }
        : EMPTY
    );
  }, [open, student, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => (isEdit ? studentService.update(student.id, values) : studentService.create(values)),
    invalidate: ['students', 'dashboard', 'seats', 'library', 'fees'],
    successMessage: isEdit ? 'Student updated' : 'Student added',
    onSuccess: (response) => {
      if (response?.data?.portalLogin) {
        toast.info(`Student portal created — email ${response.data.portalLogin.email}, temporary password ${response.data.portalLogin.temporaryPassword}`, {
          duration: 12000,
        });
      }
      onOpenChange(false);
      reset(EMPTY);
    },
  });

  const seats = (seatData?.data || []).filter((seat) => !seat.studentId || String(seat.id) === String(student?.seatId));
  const totalSeats = seatData?.meta?.total || seats.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${student?.fullName}` : 'Add a new student'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the student record. Changing the seat releases the previous one automatically.'
              : 'Enter the student details, choose a monthly fee and optionally assign a seat right away.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="s-name" required error={errors.fullName?.message}>
              <Input id="s-name" {...register('fullName')} error={errors.fullName} placeholder="Ahmed Khan" />
            </Field>
            <Field label="Father name" htmlFor="s-father" error={errors.fatherName?.message}>
              <Input id="s-father" {...register('fatherName')} placeholder="Muhammad Khan" />
            </Field>
            <Field label="Phone" htmlFor="s-phone" required error={errors.phone?.message}>
              <Input id="s-phone" {...register('phone')} error={errors.phone} inputMode="tel" placeholder="0300 1234567" />
            </Field>
            <Field label="Guardian phone" htmlFor="s-guardian" error={errors.guardianPhone?.message}>
              <Input id="s-guardian" {...register('guardianPhone')} inputMode="tel" placeholder="Optional" />
            </Field>
            <Field label="Email" htmlFor="s-email" error={errors.email?.message} hint="Required only if you want to create a student portal login.">
              <Input id="s-email" type="email" {...register('email')} error={errors.email} placeholder="Optional" />
            </Field>
            <Field label="CNIC" htmlFor="s-cnic" error={errors.cnic?.message}>
              <Input id="s-cnic" {...register('cnic')} placeholder="Optional" />
            </Field>

            <Field label="Seat" htmlFor="s-seat" hint={`${seats.length} of ${totalSeats} seats available`}>
              <Controller
                control={control}
                name="seatId"
                render={({ field }) => (
                  <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}>
                    <SelectTrigger id="s-seat"><SelectValue placeholder="Select a seat" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No seat for now</SelectItem>
                      {seats.map((seat) => (
                        <SelectItem key={seat.id} value={seat.id}>
                          Seat {seat.number} · {seat.zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Shift" htmlFor="s-shift">
              <Controller
                control={control}
                name="shift"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="s-shift"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="full_day">Full day</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Monthly fee" htmlFor="s-fee" error={errors.monthlyFee?.message} hint={`Leave 0 to bill manually. ${formatMoney(3000, currency)} shown as example.`}>
              <Input id="s-fee" type="number" min={0} {...register('monthlyFee')} error={errors.monthlyFee} />
            </Field>
            <Field label="Security deposit" htmlFor="s-deposit" error={errors.securityDeposit?.message}>
              <Input id="s-deposit" type="number" min={0} {...register('securityDeposit')} error={errors.securityDeposit} />
            </Field>
            <Field label="Registration date" htmlFor="s-date" error={errors.registrationDate?.message}>
              <Input id="s-date" type="date" {...register('registrationDate')} />
            </Field>
            <Field label="Status" htmlFor="s-status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="s-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="fee_due">Fee due</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Address" htmlFor="s-address" className="sm:col-span-2" error={errors.address?.message}>
              <Input id="s-address" {...register('address')} placeholder="House / area" />
            </Field>
            <Field label="Notes" htmlFor="s-notes" className="sm:col-span-2" error={errors.notes?.message}>
              <Textarea id="s-notes" rows={2} {...register('notes')} placeholder="Anything the staff should know about this student" />
            </Field>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary" {...register('createPortalLogin')} />
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">Create a student portal login</strong> — the student can sign in to see their
              seat, fee status and payment history. Requires an email address, and won&apos;t affect an existing account.
            </span>
          </label>

          {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>
              <UserPlus className="h-4 w-4" /> {isEdit ? 'Save changes' : 'Add student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
