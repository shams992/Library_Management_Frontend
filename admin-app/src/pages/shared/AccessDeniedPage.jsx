import { ShieldAlert, ArrowLeft, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';

const PORTAL_URLS = {
  librarian: '/librarian',
  student: '/student',
  employee: '/employee',
};

const PORTAL_NAMES = {
  librarian: 'Librarian Workspace',
  student: 'Student Portal',
  employee: 'Employee Portal',
};

export default function AccessDeniedPage() {
  const { user, signOut } = useAuth();
  const publicUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';
  const role = user?.role || 'user';
  const portalPath = PORTAL_URLS[role] || '/';
  const portalName = PORTAL_NAMES[role] || 'Main Website';
  const returnUrl = `${publicUrl}${portalPath}`;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/30 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Access Denied</CardTitle>
          <CardDescription className="text-sm mt-1">
            This administration portal is strictly reserved for platform administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-center text-sm pt-2">
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground text-left space-y-1">
            <p className="font-semibold text-foreground">Signed-in Account:</p>
            <p className="truncate font-medium text-foreground">{user?.name} ({user?.email})</p>
            <p className="capitalize">Role: <span className="font-semibold text-destructive">{role}</span></p>
          </div>

          <p className="text-muted-foreground text-xs leading-relaxed">
            Your account does not have platform administrator privileges. Please return to your appropriate portal or sign in with an administrator account.
          </p>

          <div className="flex flex-col gap-2.5 pt-1">
            <Button asChild size="default" className="w-full gap-2">
              <a href={returnUrl}>
                <ArrowLeft className="h-4 w-4" /> Return to {portalName}
                <ExternalLink className="h-3.5 w-3.5 opacity-60 ml-auto" />
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="default"
              className="w-full gap-2"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" /> Sign out & Switch account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
