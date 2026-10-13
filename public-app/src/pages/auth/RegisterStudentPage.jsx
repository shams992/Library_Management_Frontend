import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const studentSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(120),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().trim().min(7, 'Valid phone number is required'),
  cnic: z.string().trim().optional().or(z.literal('')),
});

export const RegisterStudentPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: { fullName: '', email: '', password: '', phone: '', cnic: '' },
  });

  const onSubmit = async (values) => {
    try {
      const data = await registerStudent(values);
      toast.success(`Account created! Welcome, ${data.user.name.split(' ')[0]}`);
      // Redirect straight to libraries directory so they can choose their library and apply for a seat
      navigate('/libraries', {
        state: { message: 'Account registered! Now choose a library to apply for a seat.' },
      });
    } catch (error) {
      setError('root', { message: error.message || 'Unable to register student account' });
      toast.error(error.message || 'Unable to register student account');
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 mb-1">
          <UserPlus className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Student Registration
        </h1>
        <p className="text-sm text-muted-foreground">
          Create your student account to apply to private libraries and reserve your study seat.
        </p>
      </div>

      {/* Onboarding steps ribbon */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800 text-center">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-2xs font-bold">1</span>
            Register
          </div>
          <p className="text-2xs text-muted-foreground">Create account</p>
        </div>
        <div className="space-y-1 border-x border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-2xs">2</span>
            Select Library
          </div>
          <p className="text-2xs text-muted-foreground">Apply for seat</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-2xs">3</span>
            Approval
          </div>
          <p className="text-2xs text-muted-foreground">Librarian confirms</p>
        </div>
      </div>

      {errors.root ? <Alert tone="destructive">{errors.root.message}</Alert> : null}

      <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Full Name" htmlFor="fullName" required error={errors.fullName?.message}>
            <Input
              id="fullName"
              placeholder="e.g. Ali Ahmed"
              autoComplete="name"
              {...register('fullName')}
              error={errors.fullName}
            />
          </Field>

          <Field label="Email Address" htmlFor="email" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="e.g. ali@gmail.com"
              autoComplete="email"
              {...register('email')}
              error={errors.email}
            />
          </Field>

          <Field label="Password" htmlFor="password" required error={errors.password?.message}>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                autoComplete="new-password"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone Number" htmlFor="phone" required error={errors.phone?.message}>
              <Input
                id="phone"
                placeholder="03001234567"
                autoComplete="tel"
                {...register('phone')}
                error={errors.phone}
              />
            </Field>

            <Field label="CNIC / National ID" htmlFor="cnic" hint="Optional, speeds up library approval" error={errors.cnic?.message}>
              <Input
                id="cnic"
                placeholder="42101-1234567-1"
                {...register('cnic')}
                error={errors.cnic}
              />
            </Field>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 transition-all text-base py-6 font-semibold"
            loading={isSubmitting}
          >
            Register Student Account <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-200/60 pt-4 text-center dark:border-slate-800">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudentPage;
