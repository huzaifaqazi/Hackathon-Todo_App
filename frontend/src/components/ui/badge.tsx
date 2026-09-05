import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-default",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-100 text-primary-700",
        secondary:
          "border-transparent bg-surface-muted text-ink-muted",
        destructive:
          "border-transparent bg-danger-100 text-danger-700",
        outline: "border-ink-border text-ink-muted",
        /* Task priority — the single source of truth app-wide */
        high: "border-transparent bg-danger-100 text-danger-700",
        medium: "border-transparent bg-warning-100 text-warning-700",
        low: "border-transparent bg-success-100 text-success-700",
        /* Task status */
        pending: "border-transparent bg-surface-muted text-ink-muted",
        "in-progress": "border-transparent bg-primary-100 text-primary-700",
        completed: "border-transparent bg-success-100 text-success-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
