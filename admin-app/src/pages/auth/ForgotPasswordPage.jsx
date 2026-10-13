import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, Send } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { authService } from '../../services/index.js';

const schema = z.object({ email: z.string().trim().email('Enter a valid email address') });

export default function ForgotPasswordPage() {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values) => authService.forgotPassword(values.email),
  });

  if (mutation.isSuccess) {
    const devToken = mutation.data?.data?.resetToken;
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/12">
            <MailCheck className="h-6 w-6 text-success" />
          </span>
          <h2 className="text-lg font-semibold">Check your inbox</h2>
          <p className="text-sm text-muted-foreground">
            If an account exists for <strong>{getValues('email')}</strong>, a password reset link is on its way. The link
            expires in 30 minutes.
          </p>
        </div>

        {devToken ? (
          <Alert tone="info" title="Development mode">
            Email delivery is not configured in this environment, so here is your reset link:{' '}
            <Link to={`/reset-password?token=${devToken}`} className="font-medium text-primary hover:underline">
              Reset my password
            </Link>
          </Alert>
        ) : null}

        <Button asChild variant="outline" className="w-full">
          <Link to="/login"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Enter the email address you registered with and we will send you a secure link to choose a new password.
      </p>

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
        <Field label="Email address" htmlFor="forgot-email" required error={errors.email?.message}>
          <Input id="forgot-email" type="email" autoComplete="email" placeholder="you@yourlibrary.com" {...register('email')} error={errors.email} />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          <Send className="h-4 w-4" /> Send reset link
        </Button>
      </form>

      <Button asChild variant="ghost" className="w-full">
        <Link to="/login"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
      </Button>
    </div>
  );
}
