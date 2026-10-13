import { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Sparkles, Sun, Sunset, Moon } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const BOOK_QUOTES = [
  { text: 'Books are a uniquely portable magic.', author: 'Stephen King' },
  { text: 'A room without books is like a body without a soul.', author: 'Cicero' },
  { text: 'Today a reader, tomorrow a leader.', author: 'Margaret Fuller' },
  { text: 'Libraries store the energy that fuels the imagination.', author: 'Sidney Sheldon' },
];

export const WelcomeBanner = ({
  name = 'Nasir',
  roleTitle = 'Librarian',
  libraryName,
  greetingPrefix = 'Assalam-o-Alaikum',
  subtitle = "Here's what's happening with your library today.",
  quote,
  actions,
  className,
}) => {
  const [timeGreeting, setTimeGreeting] = useState({ text: 'Good Morning', icon: Sun });
  const [randomQuote] = useState(() => quote || BOOK_QUOTES[0]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeGreeting({ text: 'Good Morning', icon: Sun });
    } else if (hour >= 12 && hour < 17) {
      setTimeGreeting({ text: 'Good Afternoon', icon: Sun });
    } else if (hour >= 17 && hour < 21) {
      setTimeGreeting({ text: 'Good Evening', icon: Sunset });
    } else {
      setTimeGreeting({ text: 'Good Night', icon: Moon });
    }
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const Icon = timeGreeting.icon;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/90 bg-gradient-to-r from-blue-100/75 via-indigo-50/70 to-purple-100/70 p-6 sm:p-7 shadow-[0_12px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:from-slate-900/90 dark:via-indigo-950/50 dark:to-slate-900/90',
        className
      )}
    >
      {/* Background 3D Book Art Illustration positioned on the right */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-1/2 md:block lg:w-5/12 overflow-hidden">
        <img
          src="/banner-books.jpg"
          alt="Library Books and Plant"
          className="h-full w-full object-cover object-right opacity-85 dark:opacity-40 transition-opacity"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,1) 70%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,1) 70%)',
          }}
        />
      </div>

      {/* Ambient soft glow bubbles */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-blue-300/20 blur-2xl dark:bg-blue-600/10" />
      <div className="pointer-events-none absolute right-1/4 -bottom-10 h-44 w-44 rounded-full bg-purple-300/20 blur-2xl dark:bg-purple-600/10" />

      {/* Content Container */}
      <div className="relative z-10 max-w-2xl">
        {/* Top Pills: Time Greeting */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {timeGreeting.text},
            <Icon className="h-3.5 w-3.5 text-amber-500 animate-pulse-soft" />
          </span>
          {libraryName ? (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 shadow-xs backdrop-blur-md dark:bg-slate-800/70 dark:text-slate-300">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              {libraryName}
            </span>
          ) : null}
        </div>

        {/* Big Greeting Heading */}
        <h1 className="mt-2 text-2xl sm:text-3xl lg:text-[2rem] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          {greetingPrefix}, {name} <span className="inline-block animate-wave">👋</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-1 text-sm sm:text-base font-normal text-slate-600 dark:text-slate-300">
          {subtitle}
        </p>

        {/* Date pill and Stephen King inspirational quote */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* Date Widget Pill */}
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-3.5 py-1.5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-slate-800/80">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Today</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{todayFormatted}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Inspirational Quote */}
          {randomQuote ? (
            <div className="hidden sm:inline-flex items-center rounded-2xl border border-white/60 bg-white/50 px-3.5 py-1.5 backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40">
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                “{randomQuote.text}”
                <span className="ml-1.5 font-semibold not-italic text-slate-500 dark:text-slate-400">
                  — {randomQuote.author}
                </span>
              </p>
            </div>
          ) : null}
        </div>

        {/* Optional Actions Slot */}
        {actions ? <div className="mt-5">{actions}</div> : null}
      </div>
    </div>
  );
};
