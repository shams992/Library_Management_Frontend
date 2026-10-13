import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { cn } from '../../utils/cn.js';

/** Light / dark / system switch — persisted in localStorage by ThemeProvider. */
export const ThemeToggle = ({ className, variant = 'ghost' }) => {
  const { resolvedTheme, theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="icon" className={cn('h-9 w-9', className)} aria-label="Change colour theme">
          {resolvedTheme === 'dark' ? <Moon className="h-[1.05rem] w-[1.05rem]" /> : <Sun className="h-[1.05rem] w-[1.05rem]" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-muted' : undefined}>
          <Sun className="h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-muted' : undefined}>
          <Moon className="h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-muted' : undefined}>
          <Monitor className="h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
