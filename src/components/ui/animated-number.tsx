"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  duration = 1000,
  className
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const valueChange = endValue - startValue;

    if (valueChange === 0) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (valueChange * easedProgress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        startTimeRef.current = undefined;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration, displayValue]);

  return (
    <span className={cn("font-numeric", className)}>
      {prefix}
      {displayValue.toFixed(1)}
      {suffix}
    </span>
  );
}