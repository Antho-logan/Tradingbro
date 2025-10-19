export type TFValue =
  | "1m"|"5m"|"15m"|"30m"
  | "1h"|"4h"
  | "1D"|"2D"|"3D"|"4D"
  | "1W"|"1M"
  | { custom: string }; // e.g. "90m", "2H", "3W"

export const STANDARD_TIMEFRAMES: { label: string; value: string }[] = [
  // Minutes
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "30m", value: "30m" },
  // Hours
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  // Days
  { label: "1D", value: "1D" },
  { label: "2D", value: "2D" },
  { label: "3D", value: "3D" },
  { label: "4D", value: "4D" },
  // Week/Month
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
];

export function validateCustomTimeframe(value: string): boolean {
  // Pattern: number followed by unit (m/h/d/w/M)
  const pattern = /^\d+\s*(m|h|d|w|M)$/i;
  return pattern.test(value.trim());
}

export function normalizeTimeframe(value: string): string {
  const trimmed = value.trim();
  
  // Check if it's already a standard timeframe
  if (STANDARD_TIMEFRAMES.some(tf => tf.value === trimmed)) {
    return trimmed;
  }
  
  // Normalize custom timeframe (ensure consistent format)
  if (validateCustomTimeframe(trimmed)) {
    // Remove spaces and convert unit to lowercase (except M for month)
    const match = trimmed.match(/^(\d+)\s*(m|h|d|w|M)$/i);
    if (match) {
      const [, num, unit] = match;
      return `${num}${unit.toUpperCase() === 'M' ? 'M' : unit.toLowerCase()}`;
    }
  }
  
  return trimmed; // Return as-is if invalid
}

export function isCustomTimeframe(value: string): boolean {
  return !STANDARD_TIMEFRAMES.some(tf => tf.value === value);
}