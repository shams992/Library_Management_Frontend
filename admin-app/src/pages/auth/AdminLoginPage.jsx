import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Fingerprint, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

/** Dedicated, visually distinct sign-in for platform administrators. */
export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const data = await signIn({ ...values, portal: 'admin' });
      toast.success(`Signed in as ${data.user.name}`);
      navigate('/', { replace: true });
    } catch (error) {
      setError('root', { message: error.message || 'Unable to sign in' });
      toast.error(error.message || 'Unable to sign in');
    }
  };

  return (
    <div className="space-y-6">
      <Alert tone="warning" title="Restricted area">
        Platform administration manages every library, subscription and payment. Unauthorised access attempts are logged.
      </Alert>

      {errors.root ? <Alert tone="destructive">{errors.root.message}</Alert> : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Administrator email" htmlFor="admin-email" required error={errors.email?.message}>
          <Input id="admin-email" type="email" autoComplete="email" placeholder="admin@example.com" {...register('email')} error={errors.email} />
        </Field>

        <Field label="Password" htmlFor="admin-password" required error={errors.password?.message}>
          <div className="relative">
            <Input
              id="admin-password"
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

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          <Fingerprint className="h-4 w-4" /> Sign in to platform control
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Not an administrator?{' '}
        <a
          href={import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173'}
          className="font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          Back to main website
        </a>
      </p>
    </div>
  );
}
