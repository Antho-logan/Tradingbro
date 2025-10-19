"use client";

import * as React from "react";
import { easeInOutCubic, fitToRange, lerp } from "@/lib/chart";
import { cn } from "@/lib/utils";

type Props = {
  data: number[];
  height?: number;
  posColor?: string; // cyan
  negColor?: string; // violet
  durationMs?: number;
  className?: string;
};

export function AnimatedBarChart({
  data,
  height = 240,
  posColor = "#06b6d4",
  negColor = "#8b5cf6",
  durationMs = 600,
  className,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [w, setW] = React.useState(600);
  const prev = React.useRef<number[] | null>(null); // null => first mount

  React.useEffect(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;
    const obs = new ResizeObserver(() => setW(el.clientWidth));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const src = prev.current ?? new Array(data.length).fill(0); // start from 0 on mount
    const dst = data;
    const n = Math.max(src.length, dst.length);
    const { min, max } = fitToRange([...src, ...dst, 0], 0.15);

    const pad = { l: 8, r: 8, t: 10, b: 24 };
    const W = w - pad.l - pad.r;
    const H = height - pad.t - pad.b;
    const bw = Math.max(2, W / n - 6);
    const zeroY = (val: number) => pad.t + H - ((val - min) / (max - min)) * H;

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.setLineDash([3, 5]);
      for (let g = 0; g <= 4; g++) {
        const y = pad.t + (g / 4) * H;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(pad.l + W, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      const zy = zeroY(0);
      ctx.moveTo(pad.l, zy);
      ctx.lineTo(pad.l + W, zy);
      ctx.stroke();

      // simple x labels 1..n
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let g = 0; g <= 4; g++) {
        const i = Math.round((g / 4) * (n - 1));
        const x = pad.l + i * (W / n) + 3 + bw / 2;
        ctx.fillText(`${i + 1}`, x, pad.t + H + 6);
      }
    };

    let start: number | null = null;
    const dur = Math.max(250, durationMs);

    const animate = (ts: number) => {
      if (start === null) start = ts;
      const t = easeInOutCubic(Math.min(1, (ts - start) / dur));
      ctx.clearRect(0, 0, w, height);
      drawGrid();

      for (let i = 0; i < n; i++) {
        const a = src[Math.min(i, src.length - 1)] ?? 0;
        const b = dst[Math.min(i, dst.length - 1)] ?? 0;
        const v = lerp(a, b, t);
        const x = pad.l + i * (W / n) + 3;
        const zy = zeroY(0);
        const y = zeroY(v);
        ctx.fillStyle = v >= 0 ? posColor : negColor;
        const top = Math.min(y, zy);
        const h = Math.abs(zy - y);
        ctx.fillRect(x, top, bw, h);
      }
      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    prev.current = data.slice();
  }, [data, height, w, posColor, negColor, durationMs]);

  return (
    <div className={cn("relative w-full", className)}>
      <canvas ref={canvasRef} aria-label="P&L by day chart" role="img" />
    </div>
  );
}