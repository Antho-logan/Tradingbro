"use client";

import { useEffect, useState } from "react";

export default function AnimatedNumber({
  to,
  duration = 800,
  prefix = "",
  suffix = "",
  format = (n: number) => n.toFixed(0),
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setVal(to); return; }
    const t0 = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setVal(to * eased);
      if (k < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return <span>{prefix}{format(val)}{suffix}</span>;
}