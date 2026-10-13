import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, ShieldCheck, UserRound, UserRoundCog } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { PORTAL_ROOT } from '../../utils/navigation.js';
import { cn } from '../../utils/cn.js';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

/** Shared sign-in used by the librarian, student and employee portals. */
export const LoginPage = ({ portal = 'librarian', title, subtitle, showPortalTabs = true }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [activePortal, setActivePortal] = useState(portal);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    try {
      const data = await signIn({ ...values, portal: activePortal });
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
      const fallback = PORTAL_ROOT[data.user.role] || '/';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (error) {
      setError('root', { message: error.message || 'Unable to sign in' });
      toast.error(error.message || 'Unable to sign in');
    }
  };

  return (
    <div className="space-y-6">
      {showPortalTabs ? (
        <Tabs value={activePortal} onValueChange={setActivePortal}>
          <TabsList className="w-full">
            <TabsTrigger value="librarian" className="flex-1">
              <ShieldCheck className="h-4 w-4" /> Librarian
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex-1">
              <UserRoundCog className="h-4 w-4" /> Staff
            </TabsTrigger>
            <TabsTrigger value="student" className="flex-1">
              <UserRound className="h-4 w-4" /> Student
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ) : null}

      {title ? (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      ) : null}

      {errors.root ? <Alert tone="destructive">{errors.root.message}</Alert> : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Email address" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={
              activePortal === 'librarian'
                ? 'you@yourlibrary.com'
                : activePortal === 'employee'
                ? 'staff@yourlibrary.com'
                : 'student@example.com'
            }
            {...register('email')}
            error={errors.email}
          />
        </Field>

        <Field label="Password" htmlFor="password" required error={errors.password?.message}>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
          <span className="text-xs text-muted-foreground">
            {activePortal === 'librarian' ? 'Librarian portal' : 'Student portal'}
          </span>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          <LogIn className="h-4 w-4" /> Sign in
        </Button>
      </form>

      {activePortal === 'librarian' ? (
        <p className="text-center text-sm text-muted-foreground">
          New to LibraDesk?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">Register your library</Link>
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Student accounts are created by your library. Ask the librarian to enable portal access for you.
        </p>
      )}

      <div className="border-t border-border pt-4 text-center">
        <Link
          to="/admin/login"
          className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground')}
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Platform administrator sign-in
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
