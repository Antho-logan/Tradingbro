"use client";
import * as React from "react";

const TF_OPTIONS = [
  "1m","5m","15m","30m",
  "1h","4h",
  "1D","2D","3D","4D",
  "1W","1M", // 1M = month (to avoid clash with 1m)
  "Custom…",
];

function normalize(val: string) {
  // map 1mo → 1M, allow m/h/d/w/M suffixes
  return val.trim();
}

export type TimeframeSelectProps = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export function TimeframeSelect({ value, onChange, className }: TimeframeSelectProps) {
  const [custom, setCustom] = React.useState("");

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "Custom…") return;
    onChange(normalize(v));
  };

  const showCustom = value.toLowerCase() === "custom…" || !TF_OPTIONS.includes(value);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <select
          value={TF_OPTIONS.includes(value) ? value : "Custom…"}
          onChange={handleSelect}
          className="h-10 w-28 rounded-xl border border-neutral-200 bg-white px-3 text-sm no-ring"
        >
          {TF_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        {showCustom && (
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onBlur={() => {
              if (!custom) return;
              // simple validation: number + unit
              const ok = /^\d+\s*(m|h|d|w|M)$/i.test(custom);
              onChange(ok ? normalize(custom) : value);
            }}
            placeholder="e.g. 90m / 2H / 3W"
            className="h-10 w-40 rounded-xl border border-neutral-200 bg-white px-3 text-sm no-ring"
          />
        )}
      </div>
    </div>
  );
}