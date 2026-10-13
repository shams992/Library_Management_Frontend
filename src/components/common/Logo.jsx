import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

/** Inline SVG mark — no external assets, crisp in both themes. */
export const BookMark = ({ className }) => (
  <svg viewBox="0 0 64 64" className={cn('h-9 w-9', className)} role="presentation" aria-hidden="true">
    <rect width="64" height="64" rx="16" className="fill-primary" />
    <path d="M16 18.5c0-1.4 1.1-2.5 2.5-2.5H30c1.7 0 3 1.3 3 3v26c0-1.7-1.3-3-3-3H18.5A2.5 2.5 0 0 1 16 39.5v-21Z" fill="#fff" opacity=".95" />
    <path d="M48 18.5c0-1.4-1.1-2.5-2.5-2.5H34c-1.7 0-3 1.3-3 3v26c0-1.7 1.3-3 3-3h11.5a2.5 2.5 0 0 0 2.5-2.5v-21Z" className="fill-primary-foreground/60" />
    <circle cx="32" cy="50.5" r="2.2" className="fill-accent" />
  </svg>
);

export const Logo = ({ to = '/', brandName = 'LibraDesk', showTagline = false, className, markClassName, inverted = false }) => (
  <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label={`${brandName} home`}>
    <BookMark className={cn('transition-transform duration-300 group-hover:scale-[1.04]', markClassName)} />
    <span className="flex flex-col leading-none">
      <span className={cn('text-[1.05rem] font-semibold tracking-tight', inverted ? 'text-white' : 'text-foreground')}>{brandName}</span>
      {showTagline ? (
        <span className={cn('mt-0.5 text-[0.68rem] font-medium uppercase tracking-[0.16em]', inverted ? 'text-white/60' : 'text-muted-foreground')}>
          Library OS
        </span>
      ) : null}
    </span>
  </Link>
);
