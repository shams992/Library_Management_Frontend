import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Clock, Mail, MapPin, MessagesSquare, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button.jsx';
import { Card } from '../../components/ui/card.jsx';
import { Input, Textarea } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { SectionHeading } from '../../components/common/SectionHeading.jsx';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon.jsx';
import { contactService } from '../../services/index.js';
import { useSettings } from '../../hooks/useSettings.js';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().max(24).optional(),
  subject: z.string().trim().min(3, 'Please add a subject').max(200),
  message: z.string().trim().min(10, 'Please tell us a little more (10 characters minimum)').max(3000),
});

export default function ContactPage() {
  const { brand, marketing } = useSettings();
  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values) => contactService.submit(values),
    onSuccess: (response) => {
      toast.success(response.message || 'Message sent');
      reset();
    },
    onError: (error) => toast.error(error.message || 'Could not send your message'),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        align="left"
        eyebrow="Contact"
        title={`Talk to the team behind ${brand.name}`}
        description="Questions about pricing, migrating from registers, or running multiple branches? Send us a message — a real person replies."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          {isSubmitSuccessful ? (
            <Alert tone="success" title="Thanks for reaching out" className="mb-5">
              Your message has been received and appears in our support inbox. We usually reply within one business day.
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" htmlFor="contact-name" required error={errors.name?.message}>
                <Input id="contact-name" {...register('name')} error={errors.name} autoComplete="name" placeholder="Ahmed Khan" />
              </Field>
              <Field label="Email" htmlFor="contact-email" required error={errors.email?.message}>
                <Input id="contact-email" type="email" {...register('email')} error={errors.email} autoComplete="email" placeholder="you@example.com" />
              </Field>
              <Field label="Phone" htmlFor="contact-phone" error={errors.phone?.message}>
                <Input id="contact-phone" {...register('phone')} inputMode="tel" placeholder="Optional" />
              </Field>
              <Field label="Subject" htmlFor="contact-subject" required error={errors.subject?.message}>
                <Input id="contact-subject" {...register('subject')} error={errors.subject} placeholder="e.g. Pricing for 3 branches" />
              </Field>
            </div>

            <Field label="Message" htmlFor="contact-message" required error={errors.message?.message}>
              <Textarea id="contact-message" rows={6} {...register('message')} error={errors.message} placeholder="Tell us about your library and what you need…" />
            </Field>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">We never share your details with third parties.</p>
              <Button type="submit" loading={mutation.isPending}>
                <Send className="h-4 w-4" /> Send message
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Support information</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">WhatsApp</p>
                  <a
                    href="https://wa.me/923158750992"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    03158750992
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">Fastest response for queries & payment verification</p>
                  <div className="mt-2">
                    <Button asChild size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5 shadow-xs">
                      <a href="https://wa.me/923158750992" target="_blank" rel="noreferrer noopener">
                        <WhatsAppIcon className="h-3.5 w-3.5" /> Chat on WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3 pt-2 border-t border-border">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Mail className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">Official Email</p>
                  <a
                    href="mailto:team@balochdev.com"
                    className="block break-all text-sm font-medium text-primary hover:underline"
                  >
                    team@balochdev.com
                  </a>
                  <p className="mt-0.5 text-xs text-muted-foreground">For general inquiries, onboarding & partnerships</p>
                </div>
              </li>

              {brand.address ? (
                <li className="flex items-start gap-3 pt-2 border-t border-border">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <MapPin className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Office</p>
                    <p className="text-muted-foreground">{brand.address}</p>
                  </div>
                </li>
              ) : null}

              {marketing.supportHours ? (
                <li className="flex items-start gap-3 pt-2 border-t border-border">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Clock className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Support hours</p>
                    <p className="text-muted-foreground">{marketing.supportHours}</p>
                  </div>
                </li>
              ) : null}
            </ul>
          </Card>

          <Alert tone="info" icon>
            <span className="inline-flex items-start gap-2 text-sm">
              <MessagesSquare className="mt-0.5 h-4 w-4" />
              Already a LibraDesk library? You get a direct support channel inside your dashboard under
              <strong className="mx-1">Messages</strong> — replies appear there instantly.
            </span>
          </Alert>
        </div>
      </div>
    </div>
  );
}
