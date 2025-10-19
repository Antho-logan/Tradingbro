"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  wins: number;
  losses: number;
  size?: number;
  strokeWidth?: number;
  durationMs?: number;
  className?: string;
};

export function DonutWinsLosses({
  wins,
  losses,
  size = 180,
  strokeWidth = 18,
  durationMs = 800,
  className,
}: Props) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [progress, setProgress] = React.useState(0);
  const prev = React.useRef({ wins, losses });

  React.useEffect(() => {
    const total = Math.max(1, wins + losses);
    const winPct = wins / total;
    const prevWinPct = prev.current.wins / Math.max(1, prev.current.wins + prev.current.losses);

    let start: number | null = null;
    const duration = Math.max(200, durationMs);

    const animate = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      // easeInOutCubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(prevWinPct + (winPct - prevWinPct) * eased);

      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    prev.current = { wins, losses };
  }, [wins, losses, durationMs]);

  const total = Math.max(1, wins + losses);
  const winPct = wins / total;
  const lossPct = losses / total;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const winLength = circumference * winPct * progress;
  const lossLength = circumference * lossPct * progress;

  const center = size / 2;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        role="img"
        aria-label={`Wins vs Losses: ${wins} wins, ${losses} losses`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />

        {/* Wins segment */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={`${winLength} ${circumference}`}
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Losses segment */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeDasharray={`${lossLength} ${circumference}`}
          strokeDashoffset={winLength}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900">
          {total > 0 ? `${(winPct * 100).toFixed(0)}%` : "0%"}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {total} trades
        </div>
      </div>
    </div>
  );
}