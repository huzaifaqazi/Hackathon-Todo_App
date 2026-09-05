import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wide font-display ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "btn-shine bg-primary-600 text-white shadow-subtle hover:bg-primary-700 hover:shadow-glow-primary hover:-translate-y-0.5",
        destructive:
          "btn-shine bg-danger-600 text-white shadow-subtle hover:bg-danger-700 hover:shadow-lifted hover:-translate-y-0.5",
        outline: "border border-ink-border bg-white text-ink hover:bg-surface-muted hover:border-ink-subtle",
        secondary: "bg-surface-muted text-ink hover:bg-ink-border",
        ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
        success:
          "btn-shine bg-success-600 text-white shadow-subtle hover:bg-success-700 hover:shadow-lifted hover:-translate-y-0.5",
        "outline-primary": "border border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700",
        "outline-danger": "border border-danger-600 text-danger-600 hover:bg-danger-50 hover:border-danger-700",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-input",
        sm: "h-9 px-3 rounded-input",
        lg: "h-11 px-6 text-base rounded-input",
        xl: "h-12 px-8 text-base rounded-input",
        icon: "h-10 w-10 rounded-input hover:scale-105",
        "icon-sm": "h-8 w-8 rounded-input hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
