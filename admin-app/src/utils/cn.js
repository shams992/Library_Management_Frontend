import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className combiner. */
export const cn = (...inputs) => twMerge(clsx(inputs));
