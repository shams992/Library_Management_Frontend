import { useState } from 'react';
import { Check, Copy, CreditCard, ExternalLink, ShieldCheck, Smartphone, User, Wallet } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { cn } from '../../utils/cn.js';

export const OFFICIAL_BILLING_INFO = {
  accountName: 'Shams Ud Din',
  whatsappNumber: '03158750992',
  whatsappUrl: 'https://wa.me/923158750992',
  supportEmail: 'team@balochdev.com',
  amountDueDefault: 1000,
  methods: [
    {
      id: 'sadapay',
      name: 'SadaPay',
      number: '03332826358',
      type: 'Wallet / Digital Bank',
      icon: Smartphone,
      accent: 'border-cyan-500/30 text-cyan-500 bg-cyan-500/10',
    },
    {
      id: 'nayapay',
      name: 'NayaPay',
      number: '03332826358',
      type: 'Wallet / Digital Bank',
      icon: CreditCard,
      accent: 'border-orange-500/30 text-orange-500 bg-orange-500/10',
    },
    {
      id: 'easypaisa',
      name: 'Easypaisa',
      number: '03329070474',
      type: 'Mobile Account',
      icon: Wallet,
      accent: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10',
    },
  ],
};

function CopyButton({ textToCopy, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const input = document.createElement('input');
        input.value = textToCopy;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Button
      type="button"
      size="xs"
      variant={copied ? 'outline' : 'secondary'}
      onClick={handleCopy}
      className={cn('h-8 gap-1.5 font-medium transition-all', copied && 'border-success text-success bg-success/10', className)}
      aria-label={`Copy ${textToCopy}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}

export function BillingPaymentInfo({
  amountDue,
  className,
  title = 'Billing & Payment',
  description = 'Official platform accounts for subscription and renewal payments.',
  showCardWrapper = true,
  onActionClick,
  actionLabel,
}) {
  const content = (
    <div className="space-y-5">
      {/* Amount Due Banner (if provided) */}
      {amountDue !== undefined && amountDue !== null && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Subscription Payment</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              Rs. {Number(amountDue).toLocaleString('en-PK')}
            </p>
          </div>
          <Badge tone="info" className="px-3 py-1 text-xs">
            Monthly Subscription · First 1 month free
          </Badge>
        </div>
      )}

      {/* Account Holder Name */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <User className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Account Name</p>
              <p className="text-base font-semibold text-foreground tracking-tight">
                {OFFICIAL_BILLING_INFO.accountName}
              </p>
            </div>
          </div>
          <CopyButton textToCopy={OFFICIAL_BILLING_INFO.accountName} label="Copy Name" />
        </div>
      </div>

      {/* Payment Methods Cards */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Available Payment Methods
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {OFFICIAL_BILLING_INFO.methods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-foreground">{method.name}</span>
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg border text-xs', method.accent)}>
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">{method.type}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold tracking-wide text-foreground">
                    {method.number}
                  </span>
                  <CopyButton textToCopy={method.number} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WhatsApp for Payment Confirmation Box */}
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                WhatsApp for payment confirmation
              </p>
              <a
                href={OFFICIAL_BILLING_INFO.whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-base font-bold text-foreground hover:text-emerald-600 transition-colors"
              >
                {OFFICIAL_BILLING_INFO.whatsappNumber}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CopyButton textToCopy={OFFICIAL_BILLING_INFO.whatsappNumber} label="Copy Number" />
            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5 shadow-xs"
            >
              <a href={OFFICIAL_BILLING_INFO.whatsappUrl} target="_blank" rel="noreferrer noopener">
                <WhatsAppIcon className="h-4 w-4" />
                <span>Contact on WhatsApp</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            </Button>
          </div>
        </div>

        {/* Clear Instructions */}
        <div className="mt-3.5 border-t border-emerald-500/20 pt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong>Payment Confirmation:</strong> After making your payment, send the payment receipt/screenshot to our
            WhatsApp number (
            <a
              href={OFFICIAL_BILLING_INFO.whatsappUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-foreground underline hover:text-emerald-600"
            >
              {OFFICIAL_BILLING_INFO.whatsappNumber}
            </a>
            ) for verification.
          </p>
        </div>
      </div>

      {actionLabel && onActionClick && (
        <div className="pt-1">
          <Button type="button" onClick={onActionClick} className="w-full sm:w-auto">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );

  if (!showCardWrapper) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-primary" /> {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">{content}</CardContent>
    </Card>
  );
}
