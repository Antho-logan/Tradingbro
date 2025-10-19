"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Retro terminal with a continuously animating SVG price chart.
 * - Up segments = green, down segments = red
 * - Smooth left-to-right motion via shifting point buffer
 * - Pauses when out of view; respects prefers-reduced-motion
 * - No external deps
 */
export function TerminalChart({
  className,
  height = 280,
  points = 96,          // number of samples across the width
  speed = 1,            // 1 = normal, 2 = faster
  volatility = 0.9,     // randomness of steps (0.4—1.2 good)
}: {
  className?: string;
  height?: number;
  points?: number;
  speed?: number;
  volatility?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(560);
  const [visible, setVisible] = useState(true);
  const [series, setSeries] = useState<number[] | null>(null);

  // responsive width
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((ents) => {
      const w = Math.max(360, Math.round(ents[0].contentRect.width));
      setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // visibility (pause when not on screen)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // seed initial series [0..1] normalized
  useEffect(() => {
    const seed: number[] = [];
    let v = 0.5;
    for (let i = 0; i < points; i++) {
      v = clamp01(v + (Math.random() - 0.5) * 0.1);
      seed.push(v);
    }
    setSeries(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // animation: push new value, pop first, re-render
  useEffect(() => {
    if (!series || prefersReduced) return;
    let raf = 0;
    let acc = 0;

    const step = () => {
      if (!visible) {
        raf = requestAnimationFrame(step);
        return;
      }
      acc += 0.016 * speed; // ~60fps
      if (acc >= 0.045) {
        acc = 0;

        setSeries((prev) => {
          if (!prev) return prev;
          const last = prev[prev.length - 1]!;
          // bias to bounce back toward the middle (0.5) so it keeps oscillating
          const gravity = (0.5 - last) * 0.08;
          const noise = (Math.random() - 0.5) * 0.22 * volatility;
          let next = last + gravity + noise;
          next = clamp01(next);

          const out = prev.slice(1);
          out.push(next);
          return out;
        });
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [series, speed, volatility, visible, prefersReduced]);

  const { gridLines, segments, lastDot, stats } = useMemo(() => {
    const pad = 18;
    const innerW = Math.max(1, width - pad * 2);
    const innerH = Math.max(1, height - pad * 2);

    const segs: { x1: number; y1: number; x2: number; y2: number; up: boolean }[] = [];
    if (!series) {
      return {
        gridLines: [],
        segments: segs,
        lastDot: { x: pad, y: pad + innerH / 2 },
        stats: { rr: 2.1, risk: 1.0, reward: 2.3, conf: 0.82 },
      };
    }

    // map normalized [0..1] to pixel space (invert y)
    const Y = (n: number) => pad + (1 - n) * innerH;
    const X = (i: number) => pad + (i / (series.length - 1)) * innerW;

    for (let i = 1; i < series.length; i++) {
      const x1 = X(i - 1);
      const y1 = Y(series[i - 1]!);
      const x2 = X(i);
      const y2 = Y(series[i]!);
      segs.push({ x1, y1, x2, y2, up: series[i]! >= series[i - 1]! });
    }

    // simple grid verticals
    const gridLines = Array.from({ length: 6 }).map((_, i) => {
      const x = pad + (i / 5) * innerW;
      return { x1: x, y1: pad, x2: x, y2: pad + innerH };
    });

    const lastDot = {
      x: X(series.length - 1),
      y: Y(series[series.length - 1]!),
    };

    // toy stats from current motion (for the green/yellow footer lines)
    const gains = segs.filter((s) => s.up).length;
    const losses = segs.length - gains;
    const rr = 2.0 + (gains - losses) / segs.length; // playful variation
    const risk = 1 + Math.max(0, (losses - gains) / segs.length) * 1.2;
    const reward = Math.max(1.6, rr * 1.1);
    const conf = clamp01(0.7 + (gains - losses) / (segs.length * 2));

    return { gridLines, segments: segs, lastDot, stats: { rr, risk, reward, conf } };
  }, [series, width, height]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "rounded-2xl border bg-zinc-900 text-zinc-100 shadow-xl",
        "border-white/10 backdrop-blur-sm",
        "relative overflow-hidden",
        className
      )}
      aria-label="retro terminal chart"
    >
      {/* window bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
        <div className="ml-3 text-xs text-zinc-400">trader@terminal — ~/analysis</div>
      </div>

      {/* terminal body */}
      <div className="p-3 sm:p-4 space-y-3 font-mono text-[12px] leading-relaxed">
        {/* "typing" header */}
        <TypingLine
          lines={[
            "$ ./analyze_chart --symbol=BTCUSD --timeframe=1m",
            "Loading market data...",
            "Analyzing price action...",
            "Generating signals...",
          ]}
        />

        {/* chart */}
        <div
          className="rounded-xl border border-white/10 bg-zinc-950/60 relative"
          style={{ height }}
        >
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            {/* grid */}
            <g stroke="currentColor" opacity="0.15">
              {gridLines.map((g, i) => (
                <line key={i} {...g} />
              ))}
              <rect
                x="18"
                y="18"
                width={Math.max(1, width - 36)}
                height={Math.max(1, height - 36)}
                fill="none"
                stroke="currentColor"
                opacity="0.15"
                rx="10"
              />
            </g>

            {/* line segments: green for up, red for down */}
            <g strokeWidth="2.2" strokeLinecap="round">
              {segments.map((s, i) => (
                <line
                  key={i}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke={s.up ? "#22c55e" : "#ef4444"}
                  style={{
                    filter: s.up
                      ? "drop-shadow(0 0 6px rgba(34,197,94,0.35))"
                      : "drop-shadow(0 0 6px rgba(239,68,68,0.35))",
                  }}
                />
              ))}
            </g>

            {/* last point */}
            <g>
              <circle cx={lastDot.x} cy={lastDot.y} r="3" fill="#e5e7eb" />
              <circle cx={lastDot.x} cy={lastDot.y} r="6" fill="transparent" stroke="#e5e7eb" opacity="0.25" />
            </g>
          </svg>
        </div>

        {/* footer "signal" lines */}
        <div className="space-y-1 pt-1">
          <div className="text-emerald-400">
            ▲ Signal: <span className="underline decoration-dotted">BULLISH</span> detected
          </div>
          <div className="text-amber-300">
            $ Risk: {stats.risk.toFixed(1)}% | Reward: {stats.reward.toFixed(1)}% | RR: {stats.rr.toFixed(1)}
          </div>
          <div className="text-zinc-400">
            Confidence: {(stats.conf * 100).toFixed(0)}% • Volume: average • Latency: low
          </div>
        </div>
      </div>

      {/* scanline overlay (subtle) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "100% 3px",
        }}
      />
    </div>
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function TypingLine({ lines }: { lines: string[] }) {
  const [idx, setIdx] = useState(0);
  const [sub, setSub] = useState(0);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) {
      setIdx(lines.length - 1);
      setSub(lines[lines.length - 1]?.length ?? 0);
      return;
    }
    let raf = 0;
    let t0 = performance.now();

    const tick = (t: number) => {
      const dt = t - t0;
      if (dt > 35) {
        t0 = t;
        setSub((s) => {
          const full = lines[idx] ?? "";
          if (s < full.length) return s + 1;
          // move to next line after pause
          setTimeout(() => {
            setIdx((i) => Math.min(lines.length - 1, i + 1));
            setSub(0);
          }, 250);
          return s;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, lines, prefersReduced]);

  return (
    <div className="space-y-0.5">
      {lines.slice(0, idx).map((ln, i) => (
        <div key={i} className="text-zinc-300">
          {ln}
        </div>
      ))}
      <div className="text-zinc-300">
        {lines[idx]?.slice(0, sub) ?? ""}
        <span className="ml-0.5 inline-block h-4 w-2 bg-zinc-300 animate-pulse align-middle" />
      </div>
    </div>
  );
}