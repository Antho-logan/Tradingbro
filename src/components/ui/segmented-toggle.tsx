"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type SegmentedToggleProps = {
  name: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  className?: string;
};

export function SegmentedToggle({
  name,
  value,
  options,
  onChange,
  className,
}: SegmentedToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = options.findIndex(opt => opt.value === value);
    let nextIndex = currentIndex;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        break;
      case "ArrowRight":
        e.preventDefault();
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        break;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      onChange(options[nextIndex].value);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={name}
      className={cn("flex flex-wrap gap-2", className)}
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          data-state={value === option.value ? "on" : "off"}
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          className={cn(
            "no-ring rounded-xl",
            value === option.value 
              ? "bg-neutral-900 text-white hover:bg-neutral-900/90" 
              : "hover:bg-neutral-100"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}