import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
        {
          "border-transparent bg-primary-500/20 text-primary-400": variant === "default",
          "border-transparent bg-white/10 text-white": variant === "secondary",
          "border-transparent bg-red-500/20 text-red-400": variant === "destructive",
          "border-white/20 text-slate-300": variant === "outline",
          "border-transparent bg-emerald-500/20 text-emerald-400": variant === "success",
          "border-transparent bg-amber-500/20 text-amber-400": variant === "warning",
          "border-transparent bg-accent-purple/20 text-accent-purple": variant === "purple",
        },
        className
      )}
      {...props}
    />
  );
}
