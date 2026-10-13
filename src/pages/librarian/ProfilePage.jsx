import { useEffect, useState } from 'react';
import { Camera, KeyRound, Save, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { Avatar, AvatarFallback, AvatarImage, Separator } from '../../components/ui/misc.jsx';
import { authService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { initials } from '../../utils/format.js';

/** My profile — name, contact details, avatar and password. */
export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
  }, [user]);

  const profileMutation = useApiMutation({
    mutationFn: (payload) => authService.updateProfile(payload),
    invalidate: ['notifications'],
    successMessage: 'Profile updated',
    onSuccess: () => refresh?.(),
  });

  const passwordMutation = useApiMutation({
    mutationFn: (payload) => authService.changePassword(payload),
    successMessage: 'Password changed successfully',
    onSuccess: () => setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }),
  });

  const avatarMutation = useApiMutation({
    mutationFn: (file) => authService.uploadAvatar(file),
    successMessage: 'Photo updated',
    onSuccess: () => refresh?.(),
  });

  const passwordMismatch = passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword;
  const passwordTooShort = passwords.newPassword && passwords.newPassword.length < 8;

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Your account details and password for the librarian dashboard." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" /> Account</CardTitle>
            <CardDescription>Signed in as {user?.role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="h-24 w-24">
                {user?.avatar?.url ? <AvatarImage src={user.avatar.url} alt="" /> : null}
                <AvatarFallback className="text-xl">{initials(user?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted">
                <Camera className="h-4 w-4" />
                {avatarMutation.isPending ? 'Uploading…' : 'Change photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      await avatarMutation.mutateAsync(file);
                    } catch (error) {
                      toast.error(error.message || 'Could not upload the photo');
                    }
                  }}
                />
              </label>
            </div>

            <Separator />

            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Library</dt>
                <dd className="font-medium">{user?.library?.name || '—'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Last login</dt>
                <dd className="font-medium">{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-PK') : '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
              <CardDescription>Used for announcements and account recovery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Full name" htmlFor="p-name" required>
                <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone" htmlFor="p-phone">
                  <Input id="p-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" autoComplete="tel" />
                </Field>
                <Field label="Email" htmlFor="p-email" hint="Changing this changes your sign-in address.">
                  <Input id="p-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => profileMutation.mutate(form)} loading={profileMutation.isPending} disabled={!form.name.trim()}>
                  <Save className="h-4 w-4" /> Save profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Change password</CardTitle>
              <CardDescription>Use at least 8 characters with a letter and a number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Current password" htmlFor="p-current" required>
                <Input id="p-current" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} autoComplete="current-password" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="New password" htmlFor="p-new" required error={passwordTooShort ? 'At least 8 characters' : undefined}>
                  <Input id="p-new" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} autoComplete="new-password" />
                </Field>
                <Field label="Confirm new password" htmlFor="p-confirm" required error={passwordMismatch ? 'Passwords do not match' : undefined}>
                  <Input id="p-confirm" type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} autoComplete="new-password" />
                </Field>
              </div>

              <Alert tone="info" icon>
                Changing your password signs out other devices that are using the old password.
              </Alert>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  loading={passwordMutation.isPending}
                  disabled={!passwords.currentPassword || !passwords.newPassword || passwordMismatch || passwordTooShort}
                  onClick={() => passwordMutation.mutate(passwords)}
                >
                  <ShieldCheck className="h-4 w-4" /> Update password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
