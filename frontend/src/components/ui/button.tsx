import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-primary-foreground hover:bg-blue-700",
        destructive: "bg-red-500 text-destructive-foreground hover:bg-red-600",
        outline: "border border-input bg-background hover:bg-gray-100 hover:border-gray-300",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        ghost: "hover:bg-gray-100 hover:text-gray-700",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        danger: "bg-red-500 text-white hover:bg-red-600",
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        "gradient-blue": "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
        "gradient-purple": "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700",
        "outline-blue": "border border-blue-500 text-blue-600 hover:bg-blue-50",
        "outline-danger": "border border-red-500 text-red-500 hover:bg-red-50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };