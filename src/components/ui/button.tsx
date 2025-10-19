"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base: same everywhere
  "inline-flex items-center justify-center font-mono font-medium rounded-full transition-all select-none no-ring",
  {
    variants: {
      variant: {
        // Primary = light grey with black outline, grey on hover
        default:
          "bg-neutral-100 text-neutral-900 border border-black hover:bg-neutral-200 shadow-sm hover:shadow-md active:opacity-95 disabled:opacity-60 disabled:pointer-events-none",
        // Outline style for secondary buttons
        outline:
          "border border-black bg-white text-neutral-900 shadow-sm hover:shadow-md hover:bg-neutral-100 rounded-full",
        // Subtle outline/ghost (kept for secondary use if needed)
        ghost:
          "bg-transparent text-neutral-900 border border-black hover:bg-neutral-100 rounded-full",
        // For links that still want black style
        link:
          "bg-transparent underline-offset-4 hover:underline text-neutral-900",
      },
      size: {
        // Unified sizes; default = md
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-[14px]",
        lg: "h-12 px-5 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
