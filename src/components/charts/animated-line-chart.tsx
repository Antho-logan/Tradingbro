"use client";

import * as React from "react";
import { easeInOutCubic, fitToRange, lerp, smoothSeries } from "@/lib/chart";
import { cn } from "@/lib/utils";

type Props = {
  data: number[];
  height?: number;
  stroke?: string;
  gradientFrom?: string;
  gradientTo?: string;
  durationMs?: number;
  className?: string;
  /** Show axis ticks/labels */
  showAxes?: boolean;
};

export function AnimatedLineChart({
  data,
  height = 260,
  stroke = "#10b981",
  gradientFrom = "rgba(16,185,129,0.18)",
  gradientTo = "rgba(16,185,129,0.00)",
  durationMs = 700,
  className,
  showAxes = true,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = React.useState({ w: 600, h: height });
  const prev = React.useRef<number[] | null>(null); // null => first mount

  // responsive
  React.useEffect(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;
    const obs = new ResizeObserver(() => setSize({ w: el.clientWidth, h: height }));
    obs.observe(el);
    return () => obs.disconnect();
  }, [height]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size.w * dpr);
    canvas.height = Math.floor(size.h * dpr);
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    // On initial mount animate from a flat baseline instead of popping
    const baseline = new Array(data.length).fill(data[0] ?? 0);
    const src = smoothSeries(prev.current ?? baseline, 2);
    const dst = smoothSeries(data, 2);

    const pad = { l: showAxes ? 36 : 8, r: 10, t: 10, b: showAxes ? 24 : 10 };
    const W = size.w - pad.l - pad.r;
    const H = size.h - pad.t - pad.b;
    const { min, max } = fitToRange([...src, ...dst], 0.15);

    const xMap = (i: number, n: number) => pad.l + (i / (n - 1)) * W;
    const yMap = (v: number) => pad.t + H - ((v - min) / (max - min)) * H;

    let start: number | null = null;
    const dur = Math.max(250, durationMs);

    const drawGrid = () => {
      if (!showAxes) return;
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      for (let g = 0; g <= 4; g++) {
        const y = pad.t + (g / 4) * H;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(pad.l + W, y);
        ctx.stroke();
        // y labels
        const val = max - ((max - min) * g) / 4;
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(val.toFixed(1), pad.l - 8, y);
        ctx.setLineDash([3, 5]);
      }
      // x ticks (5)
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let g = 0; g <= 4; g++) {
        const i = Math.round((g / 4) * (dst.length - 1));
        const x = xMap(i, dst.length);
        ctx.fillText(`${i + 1}`, x, pad.t + H + 6);
      }
      ctx.restore();
    };

    const animate = (ts: number) => {
      if (start === null) start = ts;
      const t = easeInOutCubic(Math.min(1, (ts - start) / dur));

      ctx.clearRect(0, 0, size.w, size.h);
      drawGrid();

      const n = Math.max(src.length, dst.length);
      const tween: number[] = [];
      for (let i = 0; i < n; i++) {
        const a = src[Math.min(i, src.length - 1)];
        const b = dst[Math.min(i, dst.length - 1)];
        tween.push(lerp(a, b, t));
      }

      // gradient
      const g = ctx.createLinearGradient(0, pad.t, 0, pad.t + H);
      g.addColorStop(0, gradientFrom);
      g.addColorStop(1, gradientTo);
      ctx.fillStyle = g;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;

      ctx.beginPath();
      tween.forEach((v, i) => {
        const x = xMap(i, tween.length);
        const y = yMap(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // fill under
      ctx.lineTo(pad.l + W, pad.t + H);
      ctx.lineTo(pad.l, pad.t + H);
      ctx.closePath();
      ctx.fill();

      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    prev.current = data.slice();
  }, [data, size, height, stroke, gradientFrom, gradientTo, durationMs, showAxes]);

  return (
    <div className={cn("relative w-full", className)}>
      <canvas ref={canvasRef} aria-label="Equity curve chart" role="img" />
    </div>
  );
}