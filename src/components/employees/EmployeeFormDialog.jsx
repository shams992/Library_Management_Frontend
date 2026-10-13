import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, UserPlus } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input, Textarea } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Switch } from '../ui/misc.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert } from '../ui/feedback.jsx';
import { employeeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatMoney } from '../../utils/format.js';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Enter the employee name').max(120),
  position: z.string().trim().min(1, 'What is their role?').max(80),
  department: z.string().trim().max(80).optional(),
  phone: z.string().trim().min(7, 'A contact number is required').max(20),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')).optional(),
  cnic: z.string().trim().max(20).optional(),
  address: z.string().trim().max(300).optional(),
  salary: z.coerce.number().min(0, 'Enter the monthly salary').max(10000000),
  salaryType: z.enum(['monthly', 'daily', 'hourly']),
  joiningDate: z.string().optional(),
  notes: z.string().trim().max(600).optional(),
  createPortalLogin: z.boolean().optional(),
});

const EMPTY = {
  fullName: '', position: '', department: '', phone: '', email: '', cnic: '', address: '',
  salary: 0, salaryType: 'monthly', joiningDate: new Date().toISOString().slice(0, 10),
  notes: '', createPortalLogin: false,
};

/**
 * Add or edit a staff member. Staff never sign in unless you switch the portal
 * login on — which is what keeps a library's logins under control.
 */
export const EmployeeFormDialog = ({ open, onOpenChange, employee = null, onDone }) => {
  const isEdit = Boolean(employee);
  const currency = useCurrency();
  const [credentials, setCredentials] = useState(null);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      employee
        ? {
            ...EMPTY,
            ...employee,
            joiningDate: employee.joiningDate ? String(employee.joiningDate).slice(0, 10) : EMPTY.joiningDate,
            salary: employee.salary ?? 0,
            salaryType: employee.salaryType || 'monthly',
            createPortalLogin: false,
          }
        : EMPTY
    );
  }, [open, employee, reset]);

  const wantsLogin = watch('createPortalLogin');

  const mutation = useApiMutation({
    mutationFn: (values) => {
      const payload = { ...values, email: values.email || undefined };
      return isEdit ? employeeService.update(employee.id, payload) : employeeService.create(payload);
    },
    invalidate: ['employees', 'dashboard', 'employees', 'attendance'],
    successMessage: isEdit ? 'Employee record updated' : 'Employee added',
    onSuccess: (body) => {
      const login = body?.data?.portalLogin;
      onDone?.();
      if (login?.temporaryPassword) {
        // The API generates the staff password — show it once, it is never stored in plain text.
        setCredentials(login);
        return;
      }
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" /> {isEdit ? `Edit ${employee?.fullName}` : 'Add a staff member'}
          </DialogTitle>
          <DialogDescription>
            Staff records drive payroll and attendance, so the position and salary you set here are what the salary sheets use.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="emp-name" required error={errors.fullName?.message}>
              <Input id="emp-name" {...register('fullName')} error={errors.fullName} placeholder="e.g. Ahmed Raza" />
            </Field>
            <Field label="Position / role" htmlFor="emp-position" required error={errors.position?.message}>
              <Input id="emp-position" {...register('position')} error={errors.position} placeholder="e.g. Receptionist" />
            </Field>
            <Field label="Department" htmlFor="emp-dept" error={errors.department?.message}>
              <Input id="emp-dept" {...register('department')} placeholder="e.g. Front desk" />
            </Field>
            <Field label="Phone" htmlFor="emp-phone" required error={errors.phone?.message}>
              <Input id="emp-phone" {...register('phone')} error={errors.phone} inputMode="tel" placeholder="03xx-xxxxxxx" />
            </Field>
            <Field label="Email" htmlFor="emp-email" error={errors.email?.message} hint="Needed only if this staff member signs in.">
              <Input id="emp-email" type="email" {...register('email')} error={errors.email} />
            </Field>
            <Field label="CNIC" htmlFor="emp-cnic" error={errors.cnic?.message}>
              <Input id="emp-cnic" {...register('cnic')} placeholder="Optional — 42101-1234567-1" />
            </Field>
            <Field label="Salary" htmlFor="emp-salary" required error={errors.salary?.message} hint={`Pays in ${currency.code}.`}>
              <Input id="emp-salary" type="number" min={0} {...register('salary')} error={errors.salary} />
            </Field>
            <Field label="Salary type" htmlFor="emp-salary-type">
              <Controller
                control={control}
                name="salaryType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="emp-salary-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="daily">Daily wage</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Joining date" htmlFor="emp-joining">
              <Input id="emp-joining" type="date" {...register('joiningDate')} />
            </Field>
            <Field label="Address" htmlFor="emp-address" className="sm:col-span-2" error={errors.address?.message}>
              <Input id="emp-address" {...register('address')} />
            </Field>
            <Field label="Notes" htmlFor="emp-notes" className="sm:col-span-2" error={errors.notes?.message}>
              <Textarea id="emp-notes" rows={2} {...register('notes')} placeholder="Shift timing, responsibilities, anything worth remembering" />
            </Field>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
            <label className="flex cursor-pointer items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-medium">Staff portal login</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Lets this employee sign in to see only their own salary history and attendance. Please add an email first.
                </span>
              </span>
              <Controller
                control={control}
                name="createPortalLogin"
                render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />}
              />
            </label>
            {wantsLogin && !watch('email') ? (
              <Alert tone="warning">Add an email address above — portal logins are created against an email.</Alert>
            ) : null}
          </div>

          {credentials ? (
            <Alert tone="success" title="Portal login created">
              <p className="text-sm">
                Share these once with {employee?.fullName || 'your staff member'} — the password is not shown again.
              </p>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-mono font-medium">{credentials.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Temporary password</dt>
                  <dd className="font-mono font-medium">{credentials.temporaryPassword}</dd>
                </div>
              </dl>
            </Alert>
          ) : null}

          {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>
              <UserPlus className="h-4 w-4" /> {isEdit ? 'Save changes' : 'Add employee'}
            </Button>
          </DialogFooter>
        </form>
        <p className="sr-only">Salary is stored in {currency.code} and can be edited later.</p>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;
