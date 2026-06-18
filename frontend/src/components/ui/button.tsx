import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'icon';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variant === 'default' && 'bg-black text-white hover:bg-zinc-800',
        variant === 'outline' &&
          'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50',
        variant === 'ghost' && 'bg-transparent hover:bg-zinc-100',
        size === 'default' && 'h-10 px-4',
        size === 'icon' && 'h-9 w-9',
        className,
      )}
      {...props}
    />
  );
}
