import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Building2, KeyRound, Save, UserCog } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Avatar, AvatarFallback, AvatarImage, Separator } from '../../components/ui/misc.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { portalService, authService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney, initials } from '../../utils/format.js';

/**
 * Employee self-service profile: staff keep their own contact details current
 * and can change their portal password. Employment terms stay read-only —
 * only the library administration can change those.
 */
export default function EmployeeProfilePage() {
  const { user, refresh } = useAuth();
  const currency = useCurrency();
  const [form, setForm] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'employee'],
    queryFn: () => portalService.employeeOverview(),
  });

  const employee = data?.data?.employee;
  const library = data?.data?.library;

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.fullName || user?.name || '',
        phone: employee.phone || '',
        email: employee.email || user?.email || '',
      });
    }
  }, [employee, user?.name, user?.email]);

  const profileMutation = useApiMutation({
    mutationFn: (payload) => authService.updateProfile(payload),
    invalidate: ['portal'],
    successMessage: 'Your details are updated',
    onSuccess: () => refresh?.(),
  });

  const passwordMutation = useApiMutation({
    mutationFn: (payload) => authService.changePassword(payload),
    successMessage: 'Password changed',
    onSuccess: () => setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }),
  });

  if (isLoading || !form) return <LoadingBlock label="Loading your profile…" className="min-h-[40vh]" />;

  const mismatch = passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword;
  const tooShort = passwords.newPassword && passwords.newPassword.length < 8;

  const details = [
    { label: 'Employee ID', value: employee?.employeeCode || '—' },
    { label: 'Position', value: employee?.position || '—' },
    { label: 'Department', value: employee?.department || '—' },
    { label: 'Joined', value: employee?.joiningDate ? formatDate(employee.joiningDate) : '—' },
    {
      label: 'Salary',
      value: employee?.salary ? `${formatMoney(employee.salary, currency)} ${employee.salaryType === 'daily' ? '/ day' : '/ month'}` : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Your contact details, employment terms and portal password." />

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16">
            {employee?.photo ? <AvatarImage src={employee.photo} alt={employee.fullName} /> : null}
            <AvatarFallback className="text-lg">{initials(employee?.fullName || user?.name || 'Staff')}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold">{employee?.fullName || user?.name}</h2>
              <StatusBadge kind="employee" status={employee?.status || 'active'} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {library?.name || 'Your library'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5" /> Staff account
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-primary" /> Contact details
            </CardTitle>
            <CardDescription>Keep these current so the library can reach you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Full name" htmlFor="ep-name" required>
              <Input id="ep-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="ep-phone" required>
                <Input id="ep-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" />
              </Field>
              <Field label="Email" htmlFor="ep-email" hint="Used for sign-in and notifications.">
                <Input id="ep-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => profileMutation.mutate(form)}
                loading={profileMutation.isPending}
                disabled={!form.name || !form.phone}
              >
                <Save className="h-4 w-4" /> Save details
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment</CardTitle>
              <CardDescription>Managed by your library administration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {details.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-right font-medium">{row.value}</span>
                </div>
              ))}
              <Separator />
              <p className="text-xs text-muted-foreground">
                Spotted something that is not right? Ask the library administration — they can update your staff record.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" /> Change password
              </CardTitle>
              <CardDescription>At least 8 characters with a letter and a number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Current password" htmlFor="ep-current" required>
                <Input
                  id="ep-current"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  autoComplete="current-password"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="New password" htmlFor="ep-new" required error={tooShort ? 'At least 8 characters' : undefined}>
                  <Input
                    id="ep-new"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm password" htmlFor="ep-confirm" required error={mismatch ? 'Passwords do not match' : undefined}>
                  <Input
                    id="ep-confirm"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    autoComplete="new-password"
                  />
                </Field>
              </div>
              {mismatch ? <Alert tone="destructive">Both new password fields must match.</Alert> : null}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  loading={passwordMutation.isPending}
                  disabled={!passwords.currentPassword || !passwords.newPassword || mismatch || tooShort}
                  onClick={() => passwordMutation.mutate(passwords)}
                >
                  Update password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
