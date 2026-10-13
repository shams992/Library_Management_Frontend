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

const validationSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password or login code is required'),
});

/** Shared sign-in used by the librarian, student and employee portals. */
export const LoginPage = ({ portal = 'librarian', title, subtitle, showPortalTabs = true }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [activePortal, setActivePortal] = useState(portal);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, reset } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: { email: '', password: '' },
  });

  const handlePortalChange = (nextPortal) => {
    setActivePortal(nextPortal);
    reset({ email: '', password: '' });
  };

  const onSubmit = async (values) => {
    try {
      const data = await signIn({ ...values, portal: activePortal });
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
      const fallback = PORTAL_ROOT[data.user.role] || (activePortal === 'student' ? '/student' : activePortal === 'employee' ? '/employee' : '/librarian');
      navigate(location.state?.from || fallback, { replace: true });
    } catch (error) {
      setError('root', { message: error.message || 'Unable to sign in' });
      toast.error(error.message || 'Unable to sign in');
    }
  };

  return (
    <div className="space-y-6">
      {showPortalTabs ? (
        <Tabs value={activePortal} onValueChange={handlePortalChange}>
          <TabsList className="w-full rounded-2xl p-1 bg-white/70 border border-white/80 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70">
            <TabsTrigger value="librarian" className="flex-1 rounded-xl">
              <ShieldCheck className="h-4 w-4" /> Librarian
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex-1 rounded-xl">
              <UserRoundCog className="h-4 w-4" /> Staff
            </TabsTrigger>
            <TabsTrigger value="student" className="flex-1 rounded-xl">
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

      {activePortal === 'student' ? (
        <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 p-3.5 text-sm space-y-1">
          <p className="font-semibold text-blue-700 dark:text-blue-300">Student Portal Sign In</p>
          <p className="text-xs text-muted-foreground">
            Sign in with your registered student email and password to view your library seats and fees.
          </p>
        </div>
      ) : activePortal === 'employee' ? (
        <div className="rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/30 p-3.5 text-sm space-y-1">
          <p className="font-semibold text-purple-700 dark:text-purple-300">Staff / Employee Sign In</p>
          <p className="text-xs text-muted-foreground">
            Use your Gmail and the special login code generated and provided by your library librarian.
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field
          label={activePortal === 'employee' ? 'Staff Gmail / Email' : activePortal === 'student' ? 'Student Email' : 'Librarian Email'}
          htmlFor="email"
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={
              activePortal === 'librarian'
                ? 'you@yourlibrary.com'
                : activePortal === 'employee'
                ? 'staff@gmail.com'
                : 'student@gmail.com'
            }
            {...register('email')}
            error={errors.email}
          />
        </Field>

        <Field
          label={activePortal === 'employee' ? 'Employee Login Code' : 'Password'}
          htmlFor="password"
          required
          error={errors.password?.message}
          hint={activePortal === 'employee' ? 'Code format: EMP-XXXXXX provided by your librarian' : undefined}
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={activePortal === 'employee' ? 'e.g. EMP-123456' : '••••••••'}
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
          {activePortal !== 'employee' ? (
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">Lost code? Ask your librarian to regenerate it.</span>
          )}
          <span className="text-xs text-muted-foreground">
            {activePortal === 'librarian' ? 'Librarian portal' : activePortal === 'employee' ? 'Staff portal' : 'Student portal'}
          </span>
        </div>

        <Button
          type="submit"
          className="w-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 transition-all"
          size="lg"
          loading={isSubmitting}
        >
          <LogIn className="h-4 w-4" /> {activePortal === 'student' ? 'Sign In as Student' : activePortal === 'employee' ? 'Staff Login' : 'Sign in as Librarian'}
        </Button>
      </form>

      {activePortal === 'librarian' ? (
        <p className="text-center text-sm text-muted-foreground">
          New to LibraDesk?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline">Register your library</Link>
        </p>
      ) : activePortal === 'student' ? (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-center dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Don't have a student account?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2.5">
            Register first as a student to join libraries and apply for seats.
          </p>
          <Button asChild size="sm" variant="outline" className="rounded-full bg-white dark:bg-slate-900 shadow-xs border-indigo-200 dark:border-indigo-800">
            <Link to="/student/register" className="text-indigo-600 font-semibold dark:text-indigo-400">
              Register as Student
            </Link>
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Employee accounts are created by library owners. Ask your librarian for your login code.
        </p>
      )}
    </div>
  );
};

export default LoginPage;
