import React from 'react';
import { cn } from '../../lib/utils';

interface GlowPillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** 'md' = default (15px 30px), 'sm' = compact (navbar etc.) */
  size?: 'md' | 'sm';
}

/**
 * Pill button with a rotating, blurred gradient glow blob behind the label.
 * The blob spins continuously and shrinks slightly on hover; the pill itself
 * tints on hover and scales down on press. Reduced motion stops the spin.
 */
export const GlowPillButton: React.FC<GlowPillButtonProps> = ({
  children,
  className,
  size = 'md',
  ...props
}) => (
  <button
    className={cn(
      'group relative inline-flex items-center justify-center overflow-hidden',
      'rounded-full border-0 font-bold cursor-pointer z-0',
      'text-[rgb(37,37,37)] shadow-[0_0px_7px_-5px_rgba(0,0,0,0.5)]',
      'transition-[background-color,color,transform] duration-200',
      'hover:bg-[rgb(193,228,248)] hover:text-[rgb(33,0,85)] active:scale-[0.97]',
      size === 'md' ? 'px-[30px] py-[15px]' : 'px-5 py-2 text-sm',
      className
    )}
    {...props}
  >
    {/* Rotating blurred gradient blob */}
    <span className="absolute inset-0 flex items-center justify-center z-[1]" aria-hidden="true">
      <span
        className="motion-reduce:!animate-none block w-40 h-40 rounded-full opacity-50 blur-[20px] transition-[width,height] duration-400 group-hover:w-32 group-hover:h-32"
        style={{
          background:
            'linear-gradient(90deg, rgba(222,0,75,1) 0%, rgba(191,70,255,1) 49%, rgba(0,212,255,1) 100%)',
          animation: 'glow-blob-spin 3s linear infinite',
        }}
      />
    </span>
    <span className="relative z-[2] inline-flex items-center gap-2">{children}</span>
  </button>
);
