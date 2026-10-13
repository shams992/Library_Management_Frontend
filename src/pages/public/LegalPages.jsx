import { Link } from 'react-router-dom';
import { SectionHeading } from '../../components/common/SectionHeading.jsx';
import { useSettings } from '../../hooks/useSettings.js';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

export function TermsPage() {
  const { brand, subscription } = useSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        align="left"
        eyebrow="Legal"
        title="Terms & Conditions"
        description={`These terms govern the use of ${brand.name} by registered libraries and their members.`}
      />
      <div className="mt-10 space-y-8">
        <Section title="1. Accounts and registration">
          <p>
            Each library registers as an independent tenant with its own account, and the librarian who registers is
            responsible for the accuracy of the information provided and for all activity under that account.
          </p>
          <p>
            Registrations are reviewed by platform administration. A library may be rejected if the submitted details cannot be
            verified or if the intended use conflicts with these terms.
          </p>
        </Section>
        <Section title="2. Registration fee, free trial and subscription">
          <p>
            Library registration requires a one-time registration fee of {subscription.currencySymbol}{' '}
            {Number(subscription.registrationFee || 2000).toLocaleString()}. New libraries receive a {subscription.trialMonths}-month free trial with full access to every module. After the
            trial, continued access requires a monthly subscription of {subscription.currencySymbol}{' '}
            {Number(subscription.priceMonthly).toLocaleString()} per month unless a different plan has been agreed in writing.
          </p>
          <p>
            If a subscription payment is not received, the account enters a payment-due state and may subsequently be
            suspended. Suspension only disables access — student, fee, employee, expense and salary records are preserved
            and become available again immediately upon reactivation.
          </p>
        </Section>
        <Section title="3. Acceptable use">
          <p>
            Libraries may not use {brand.name} to store unlawful content, to misrepresent a business, or to attempt to access
            another library&apos;s data. Platform administration may suspend accounts that breach these terms.
          </p>
        </Section>
        <Section title="4. Data ownership">
          <p>
            Each library owns its data. Platform administration accesses library records only for support, billing, fraud
            prevention or as required by law, and such access is recorded in the audit log.
          </p>
        </Section>
        <Section title="5. Availability and changes">
          <p>
            We aim for high availability but do not guarantee uninterrupted service. Features may evolve over time; material
            changes affecting pricing or data handling will be communicated to librarians in advance.
          </p>
        </Section>
        <Section title="6. Contact">
          <p>
            Questions about these terms can be sent through the <Link to="/contact" className="font-medium text-primary hover:underline">contact page</Link>{' '}
            or emailed to{' '}
            <a href={`mailto:${brand.supportEmail || 'team@balochdev.com'}`} className="font-medium text-primary hover:underline">
              {brand.supportEmail || 'team@balochdev.com'}
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  const { brand } = useSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        align="left"
        eyebrow="Legal"
        title="Privacy Policy"
        description={`How ${brand.name} collects, uses and protects data belonging to libraries and their members.`}
      />
      <div className="mt-10 space-y-8">
        <Section title="What we collect">
          <p>
            Account data (name, email, phone, hashed password), library profile data (address, timings, logo), and the
            operational records libraries choose to store: students, seats, fee invoices, employees, salaries, attendance and
            expenses.
          </p>
          <p>
            Payment records are limited to what is needed to reconcile a subscription: amount, method, reference number and
            date. We do not store card numbers.
          </p>
        </Section>
        <Section title="How we use it">
          <p>
            Data is used to operate the platform: authenticating users, isolating each library&apos;s workspace, generating
            invoices and reminders, producing reports and providing support. We do not sell data or use library records for
            advertising.
          </p>
        </Section>
        <Section title="Isolation and security">
          <p>
            Every record carries a library identifier and every API request is authorised against the caller&apos;s own tenant.
            Passwords are hashed with bcrypt, traffic is protected in transit, inputs are validated, requests are rate-limited
            and sensitive actions are written to an audit log.
          </p>
        </Section>
        <Section title="Your rights">
          <p>
            Libraries can export their data as CSV from the reports module at any time, and can request deletion of their
            account and records through platform support. Deletion is permanent and requires confirmation.
          </p>
        </Section>
        <Section title="Contact">
          <p>
            Privacy questions can be raised through the <Link to="/contact" className="font-medium text-primary hover:underline">contact page</Link> or
            by email at{' '}
            <a href={`mailto:${brand.supportEmail || 'team@balochdev.com'}`} className="font-medium text-primary hover:underline">
              {brand.supportEmail || 'team@balochdev.com'}
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">Error 404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">This page is not on our shelves</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The page you are looking for may have been moved or renamed. Try the dashboard, the library directory or head back home.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Back to home
        </Link>
        <Link to="/libraries" className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
          Browse libraries
        </Link>
      </div>
    </div>
  );
}
