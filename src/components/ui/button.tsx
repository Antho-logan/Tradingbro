import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  asChild?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-mono rounded-xl transition-colors focus:outline-none focus-visible:ring-2 ring-offset-1 ring-neutral-800 disabled:opacity-50 disabled:pointer-events-none";
  const sizes = {
    md: "h-10 px-4 text-sm",
    sm: "h-9 px-3 text-sm",
  }[size];
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-black",
    secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200",
    ghost: "bg-transparent text-neutral-900 hover:bg-neutral-100 border border-neutral-200",
  }[variant];

  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(base, sizes, variants, className)} {...props} />;
}
