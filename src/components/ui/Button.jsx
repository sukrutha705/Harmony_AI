import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/50 disabled:opacity-50 disabled:pointer-events-none",
        {
          'bg-brand-dark text-white hover:bg-brand-darker hover:-translate-y-0.5 shadow-sm': variant === 'default',
          'bg-brand-accent text-brand-dark hover:brightness-95 hover:shadow-md hover:-translate-y-0.5 active:scale-95 font-semibold': variant === 'gradient',
          'bg-white border border-slate-200 text-brand-dark hover:bg-slate-50 shadow-sm': variant === 'outline',
          'bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-brand-dark dark:hover:text-white': variant === 'ghost',
          'bg-brand-darker/10 backdrop-blur-sm border border-slate-200 text-brand-dark hover:bg-brand-darker/20': variant === 'glass',
        },
        {
          'h-10 px-6 py-2': size === 'default',
          'h-9 px-4 text-sm': size === 'sm',
          'h-12 px-8 text-lg': size === 'lg',
          'h-10 w-10': size === 'icon',
        },
        className
      )}
      {...props}
    />
  );
});

Button.displayName = "Button";
