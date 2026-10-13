import { cn } from '../../utils/cn.js';

export const SectionHeading = ({ eyebrow, title, description, align = 'center', className, children }) => (
  <div className={cn('flex flex-col gap-3', align === 'center' ? 'items-center text-center' : 'items-start text-left', className)}>
    {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
    <h2 className={cn('max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl', align === 'center' && 'mx-auto')}>
      {title}
    </h2>
    {description ? (
      <p className={cn('max-w-2xl text-base leading-relaxed text-muted-foreground', align === 'center' && 'mx-auto')}>
        {description}
      </p>
    ) : null}
    {children}
  </div>
);
