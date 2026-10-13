import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../utils/cn.js';

export const Avatar = ({ className, ...props }) => (
  <AvatarPrimitive.Root className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
);
export const AvatarImage = ({ className, ...props }) => (
  <AvatarPrimitive.Image className={cn('aspect-square h-full w-full object-cover', className)} {...props} />
);
export const AvatarFallback = ({ className, ...props }) => (
  <AvatarPrimitive.Fallback className={cn('flex h-full w-full items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary', className)} {...props} />
);

export const Progress = ({ className, value = 0, indicatorClassName, ...props }) => (
  <ProgressPrimitive.Root
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 rounded-full bg-primary transition-transform duration-500', indicatorClassName)}
      style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
    />
  </ProgressPrimitive.Root>
);

export const Separator = ({ className, orientation = 'horizontal', ...props }) => (
  <SeparatorPrimitive.Root
    orientation={orientation}
    className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    {...props}
  />
);

export const Switch = ({ className, ...props }) => (
  <SwitchPrimitive.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/40',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
);

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = ({ className, sideOffset = 6, ...props }) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      sideOffset={sideOffset}
      className={cn('z-50 max-w-xs rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md animate-in fade-in-0 zoom-in-95', className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
);

export const Skeleton = ({ className, ...props }) => <div className={cn('skeleton h-4 w-full', className)} {...props} />;
