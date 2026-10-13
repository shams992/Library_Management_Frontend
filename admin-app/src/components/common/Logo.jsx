import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

/** Inline SVG mark — matches the exact LibraDesk open book brand mark */
export const BookMark = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-9 w-9 shrink-0 drop-shadow-sm', className)} role="presentation" aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="url(#ld-admin-logo-grad)" />
    <path
      d="M18 20.5C18 19.12 19.12 18 20.5 18H29.5C30.88 18 32 19.12 32 20.5V43.5C32 42.12 30.88 41 29.5 41H20.5C19.12 41 18 42.12 18 43.5V20.5Z"
      fill="#FFFFFF"
    />
    <path
      d="M46 20.5C46 19.12 44.88 18 43.5 18H34.5C33.12 18 32 19.12 32 20.5V43.5C32 42.12 33.12 41 34.5 41H43.5C44.88 41 46 42.12 46 43.5V20.5Z"
      fill="#FFFFFF"
      fillOpacity="0.88"
    />
    <defs>
      <linearGradient id="ld-admin-logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#3730A3" />
      </linearGradient>
    </defs>
  </svg>
);

export const Logo = ({ to = '/', brandName = 'LibraDesk', showTagline = false, className, markClassName, inverted = false }) => (
  <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label={`${brandName} home`}>
    <BookMark className={cn('transition-transform duration-300 group-hover:scale-[1.04]', markClassName)} />
    <span className="flex flex-col leading-none">
      <span className={cn('text-[1.12rem] font-bold tracking-tight', inverted ? 'text-white' : 'text-slate-900 dark:text-white')}>
        {brandName}
      </span>
      {showTagline ? (
        <span className={cn('mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.16em]', inverted ? 'text-white/60' : 'text-muted-foreground')}>
          Admin Console
        </span>
      ) : null}
    </span>
  </Link>
);
