import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Armchair,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  KeyRound,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Shield,
  User,
  UserCheck,
  UserCog,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input, Textarea } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { portalService, authService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatDate, formatMoney } from '../../utils/format.js';

/** Student profile: Displays real student information from MongoDB and allows contact/password updates. */
export default function StudentProfilePage() {
  const { user, refresh } = useAuth();
  const currency = useCurrency();
  const [form, setForm] = useState({
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    guardianPhone: '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['portal', 'student', 'profile'],
    queryFn: () => portalService.studentProfile(),
  });

  const student = data?.data?.student;
  const library = data?.data?.library;
  const seat = data?.data?.seat;

  useEffect(() => {
    if (student) {
      setForm({
        phone: student.phone || '',
        alternatePhone: student.alternatePhone || '',
        email: student.email || '',
        address: student.address || '',
        guardianPhone: student.guardianPhone || '',
      });
    }
  }, [student]);

  const profileMutation = useApiMutation({
    mutationFn: (payload) => portalService.updateStudentProfile(payload),
    invalidate: ['portal'],
    successMessage: 'Your details have been updated',
    onSuccess: () => {
      refresh?.();
      refetch();
    },
  });

  const passwordMutation = useApiMutation({
    mutationFn: (payload) => authService.changePassword(payload),
    successMessage: 'Password changed successfully',
    onSuccess: () => setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }),
  });

  if (isLoading) {
    return <LoadingBlock label="Loading your profile…" className="min-h-[40vh]" />;
  }

  if (isError || (!isLoading && !student)) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" description="Your membership profile and contact settings." />
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-semibold text-foreground">Could not load profile</h3>
              <p className="text-sm text-muted-foreground">
                {error?.message || 'We were unable to load your student profile information from the server. Please try again.'}
              </p>
            </div>
            <Button onClick={() => refetch()} loading={isFetching} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mismatch = passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword;
  const tooShort = passwords.newPassword && passwords.newPassword.length < 8;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description={library ? `${library.name} · Student Member Profile` : 'Your contact details and membership record.'}
      />

      {/* Top Student Overview Summary Banner */}
      <Card className="overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 text-white font-bold text-2xl shadow-md shadow-indigo-500/30">
              {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{student.fullName}</h2>
                <StatusBadge status={student.status} kind="student" />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700">{student.studentCode || 'No ID'}</span>
                <span>·</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">{library?.name || 'Library Member'}</span>
                {student.shift && (
                  <>
                    <span>·</span>
                    <span className="capitalize font-medium text-slate-600 dark:text-slate-300">{student.shift.replace('_', ' ')} Shift</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto justify-start sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/40 px-4 py-2.5 shadow-xs backdrop-blur-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Armchair className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold tracking-wider text-amber-700/80 dark:text-amber-400">Assigned Seat</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {student.seatNumber ? `#${student.seatNumber}` : (seat?.number ? `#${seat.number}` : 'Not Assigned')}
                </p>
              </div>
            </div>
            {student.monthlyFee !== undefined && (
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/70 dark:border-indigo-900/50 dark:bg-indigo-950/40 px-4 py-2.5 shadow-xs backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-700/80 dark:text-indigo-400">Monthly Fee</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatMoney(student.monthlyFee, currency)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Alert tone="info" icon title="Administrative Fields Managed by Librarian">
        Your legal name, father&apos;s name, assigned seat, shift, and monthly fee schedule are set by the library administration.
        You can update your personal contact details, phone numbers, and portal password below.
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Contact details (Editable) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <UserCog className="h-4 w-4" />
              </div>
              <span>Contact Details</span>
            </CardTitle>
            <CardDescription>Keep these up to date for emergency alerts and fee receipts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone number" htmlFor="sp-phone" required>
                <Input
                  id="sp-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  inputMode="tel"
                  placeholder="03xx xxxxxxx"
                />
              </Field>
              <Field label="Alternate phone" htmlFor="sp-alt">
                <Input
                  id="sp-alt"
                  value={form.alternatePhone}
                  onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                  inputMode="tel"
                  placeholder="Optional backup number"
                />
              </Field>
              <Field label="Contact email" htmlFor="sp-email" hint="Used for fee reminders and updates.">
                <Input
                  id="sp-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                />
              </Field>
              <Field label="Guardian / Emergency phone" htmlFor="sp-guardian">
                <Input
                  id="sp-guardian"
                  value={form.guardianPhone}
                  onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                  inputMode="tel"
                  placeholder="Parent or guardian contact"
                />
              </Field>
            </div>
            <Field label="Residential address" htmlFor="sp-address">
              <Textarea
                id="sp-address"
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Your home or hostel address"
              />
            </Field>
            <div className="flex justify-end pt-2">
              <Button onClick={() => profileMutation.mutate(form)} loading={profileMutation.isPending} className="gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg transition-all">
                <Save className="h-4 w-4" /> Save Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Membership Info & Change Password */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <span>Membership Record</span>
              </CardTitle>
              <CardDescription>Verified details linked to your library enrollment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Full Name
                </span>
                <span className="font-semibold text-foreground">{student.fullName || '—'}</span>
              </div>
              {student.fatherName && (
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-muted-foreground">Father&apos;s Name</span>
                  <span className="font-medium text-foreground">{student.fatherName}</span>
                </div>
              )}
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Student ID Code</span>
                <span className="font-mono font-medium text-foreground">{student.studentCode || '—'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Library
                </span>
                <span className="font-medium text-foreground text-right">{library?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Armchair className="h-3.5 w-3.5" /> Assigned Seat
                </span>
                <span className="font-medium text-foreground">
                  {student.seatNumber ? `Seat ${student.seatNumber}` : (seat ? `Seat ${seat.number}` : 'None assigned')}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Study Shift
                </span>
                <span className="font-medium capitalize text-foreground">{student.shift?.replace('_', ' ') || 'Full day'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Registered Since
                </span>
                <span className="font-medium text-foreground">
                  {student.registrationDate ? formatDate(student.registrationDate) : (student.appliedAt ? formatDate(student.appliedAt) : '—')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Sign-in Email
                </span>
                <span className="font-mono text-xs font-medium text-foreground">{user?.email || student.email || '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <span>Change Password</span>
              </CardTitle>
              <CardDescription>Use at least 8 characters with letters and numbers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Current password" htmlFor="sp-current" required>
                <Input
                  id="sp-current"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  autoComplete="current-password"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="New password" htmlFor="sp-new" required error={tooShort ? 'At least 8 characters' : undefined}>
                  <Input
                    id="sp-new"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm password" htmlFor="sp-confirm" required error={mismatch ? 'Passwords do not match' : undefined}>
                  <Input
                    id="sp-confirm"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    autoComplete="new-password"
                  />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="rounded-full border border-slate-200 bg-white/80 hover:bg-white text-slate-700 shadow-xs dark:border-white/10 dark:bg-slate-900/80"
                  loading={passwordMutation.isPending}
                  disabled={!passwords.currentPassword || !passwords.newPassword || mismatch || tooShort}
                  onClick={() => passwordMutation.mutate(passwords)}
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
