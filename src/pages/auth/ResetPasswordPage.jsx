import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { authService } from '../../services/index.js';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values) => authService.resetPassword({ token, password: values.password }),
    onSuccess: () => {
      toast.success('Password updated — please sign in');
      navigate('/login', { replace: true });
    },
  });

  if (!token) {
    return (
      <Alert tone="destructive" title="Invalid reset link">
        This password reset link is missing its token. Request a new link from the{' '}
        <Link to="/forgot-password" className="font-medium underline">forgot password</Link> page.
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <KeyRound className="h-5 w-5" />
        </span>
        <p className="text-sm text-muted-foreground">Choose a strong password you have not used before.</p>
      </div>

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
        <Field label="New password" htmlFor="new-password" required error={errors.password?.message} hint="Minimum 8 characters, including a letter and a number.">
          <Input id="new-password" type="password" autoComplete="new-password" {...register('password')} error={errors.password} />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm-password" required error={errors.confirmPassword?.message}>
          <Input id="confirm-password" type="password" autoComplete="new-password" {...register('confirmPassword')} error={errors.confirmPassword} />
        </Field>

        {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          <ShieldCheck className="h-4 w-4" /> Update password
        </Button>
      </form>
    </div>
  );
}
