"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Light-mode tuned sparkline:
 * - clearer grid
 * - calmer reveal speed
 * - neutral green fill; works in light & dark via CSS vars
 */
export default function AnimatedSparkline({
  data,
  height = 120,
  pad = 20,
  stroke = "#059669",                 // emerald-600
  area = "rgba(16,185,129,0.12)",     // emerald-500 @ 12%
  grid = true,
  ariaLabel = "Sparkline",
  duration = 1100,                    // slower, smoother
}: {
  data: number[];
  height?: number;
  pad?: number;
  stroke?: string;
  area?: string;
  grid?: boolean;
  ariaLabel?: string;
  duration?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(640);
  const [p, setP] = useState(0); // 0..1 reveal

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.max(240, Math.round(entries[0].contentRect.width));
      setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setP(1); return; }

    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const t0 = performance.now();
      const loop = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        setP(1 - Math.pow(1 - k, 3));
        if (k < 1) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      io.disconnect();
    }, { threshold: 0.2 });

    if (wrapRef.current) io.observe(wrapRef.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [duration]);

  const { poly, areaPoints, innerW, innerH, padX } = useMemo(() => {
    const innerW = Math.max(1, width - pad * 2);
    const innerH = Math.max(1, height - pad * 2);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = Math.max(1, max - min);
    const pts = data.map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * innerW + pad;
      const y = height - pad - ((v - min) / span) * innerH;
      return [x, y] as const;
    });
    const poly = pts.map(([x, y]) => `${x},${y}`).join(" ");
    const areaPoints = [`${pad},${height - pad}`, ...poly.split(" "), `${width - pad},${height - pad}`].join(" ");
    return { poly, areaPoints, innerW, innerH, padX: pad };
  }, [data, width, height, pad]);

  const clipX = padX + innerW * p;

  return (
    <div ref={wrapRef} className="w-full">
      <svg width="100%" height={height} role="img" aria-label={ariaLabel}>
        <defs>
          <clipPath id="spark-clip">
            <rect x={padX} y={pad} width={Math.max(0, clipX - padX)} height={innerH} />
          </clipPath>
          <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={area} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {grid && (
          <g stroke="var(--grid-color)">
            {/* baseline + top line */}
            <line x1={padX} y1={pad} x2={width - padX} y2={pad} opacity="0.10" />
            <line x1={padX} y1={height - pad} x2={width - padX} y2={height - pad} opacity="0.10" />
          </g>
        )}

        <g clipPath="url(#spark-clip)">
          <polygon points={areaPoints} fill="url(#spark-grad)" />
          <polyline
            points={poly}
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,0.25))" }}
          />
        </g>
      </svg>
    </div>
  );
}