import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { Logo } from '../common/Logo.jsx';
import { WhatsAppIcon } from '../common/WhatsAppIcon.jsx';
import { useSettings } from '../../hooks/useSettings.js';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'Pricing', to: '/#pricing' },
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'For Libraries', to: '/#for-libraries' },
      { label: 'For Students', to: '/libraries' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Library Directory', to: '/libraries' },
      { label: 'Register Library', to: '/register' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Librarian Login', to: '/login' },
      { label: 'Student Login', to: '/student/login' },
      { label: 'Admin Login', to: '/admin/login' },
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
    ],
  },
];

export const Footer = () => {
  const { brand } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Logo brandName={brand.name} showTagline />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Multi-library management software for private libraries — students, seats, fees, employees, expenses and profit
              in one secure dashboard.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <a
                  className="font-mono hover:text-foreground transition-colors"
                  href="https://wa.me/923158750992"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {brand.supportPhone || '03158750992'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                <a
                  className="hover:text-foreground transition-colors"
                  href={`mailto:${brand.supportEmail || 'team@balochdev.com'}`}
                >
                  {brand.supportEmail || 'team@balochdev.com'}
                </a>
              </li>
              {brand.address ? (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {brand.address}
                </li>
              ) : null}
            </ul>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} {brand.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[
              { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
              { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
              { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
              { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
