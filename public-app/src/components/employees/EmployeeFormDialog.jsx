import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, CheckCircle2, Copy, KeyRound, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button.jsx';
import { Input, Textarea } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
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
  email: z.string().trim().email('Enter a valid Gmail / email address').or(z.literal('')).optional(),
  cnic: z.string().trim().max(20).optional(),
  address: z.string().trim().max(300).optional(),
  salary: z.coerce.number().min(0, 'Enter the monthly salary').max(10000000),
  salaryType: z.enum(['monthly', 'daily', 'hourly']),
  joiningDate: z.string().optional(),
  notes: z.string().trim().max(600).optional(),
});

const EMPTY = {
  fullName: '', position: '', department: '', phone: '', email: '', cnic: '', address: '',
  salary: 0, salaryType: 'monthly', joiningDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

/**
 * Add or edit a staff member. When added, a unique login code is generated
 * so the librarian can share it with the employee for staff portal access.
 */
export const EmployeeFormDialog = ({ open, onOpenChange, employee = null, onDone }) => {
  const isEdit = Boolean(employee);
  const currency = useCurrency();
  const [createdLoginCode, setCreatedLoginCode] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) {
      setCreatedLoginCode(null);
      return;
    }
    reset(
      employee
        ? {
            ...EMPTY,
            ...employee,
            joiningDate: employee.joiningDate ? String(employee.joiningDate).slice(0, 10) : EMPTY.joiningDate,
            salary: employee.salary ?? 0,
            salaryType: employee.salaryType || 'monthly',
          }
        : EMPTY
    );
  }, [open, employee, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => {
      const payload = { ...values, email: values.email || undefined };
      return isEdit ? employeeService.update(employee.id, payload) : employeeService.create(payload);
    },
    invalidate: ['employees', 'dashboard', 'attendance'],
    successMessage: isEdit ? 'Employee record updated' : 'Employee added',
    onSuccess: (body, variables) => {
      onDone?.();
      const code = body?.data?.loginCode || body?.data?.portalLogin?.loginCode;
      if (!isEdit && code) {
        setCreatedLoginCode({
          name: variables.fullName,
          email: variables.email,
          code,
        });
        return;
      }
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {createdLoginCode ? (
          <div className="space-y-4 py-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" /> Staff Member Added & Code Generated
              </DialogTitle>
              <DialogDescription>
                A staff account and secure login code have been provisioned for {createdLoginCode.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-5 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-purple-950/30 text-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Employee Login Code
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-bold tracking-widest text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-xl shadow-xs border border-indigo-200 dark:border-indigo-800">
                  {createdLoginCode.code}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="rounded-xl h-10 w-10 shadow-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(createdLoginCode.code);
                    toast.success('Login code copied to clipboard!');
                  }}
                  title="Copy login code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Send this code to the employee. They can sign in at the Staff portal using Gmail <strong className="text-slate-800 dark:text-slate-200">{createdLoginCode.email || '(registered email)'}</strong> and this code.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl"
              onClick={() => {
                const msg = `Hello ${createdLoginCode.name},\nYour staff login code for our library on LibraDesk is: ${createdLoginCode.code}\nPlease sign in at: ${window.location.origin}/login (Staff Portal tab) using your email (${createdLoginCode.email}).`;
                navigator.clipboard.writeText(msg);
                toast.success('Invite message copied to clipboard!');
              }}
            >
              <Copy className="h-4 w-4" /> Copy Full Staff Invitation Message
            </Button>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                className="w-full rounded-xl"
                onClick={() => {
                  setCreatedLoginCode(null);
                  onOpenChange(false);
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> {isEdit ? `Edit ${employee?.fullName}` : 'Add a staff member'}
              </DialogTitle>
              <DialogDescription>
                When you add an employee with their Gmail and name, a login code is automatically generated for them to access the staff portal.
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
                <Field label="Gmail / Email" htmlFor="emp-email" error={errors.email?.message} hint="Used by employee to log in with their generated code.">
                  <Input id="emp-email" type="email" placeholder="employee@gmail.com" {...register('email')} error={errors.email} />
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

              {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" loading={mutation.isPending}>
                  <UserPlus className="h-4 w-4" /> {isEdit ? 'Save changes' : 'Add employee & generate code'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;
