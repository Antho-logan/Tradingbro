"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { TimeframeSelect } from "@/components/ui/timeframe-select";
import { cn } from "@/lib/utils";
import { NewJournalEntry } from "@/types/journal";

export type NewEntryData = {
  title: string;
  symbol: string;
  side: "Long" | "Short";
  price: string;
  notes: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate?: (entry: NewEntryData) => void;
};

export function NewEntryDialog({ open, onOpenChange, onCreate }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [side, setSide] = React.useState<"long" | "short">("long");
  const [style, setStyle] = React.useState<"swing" | "scalp">("swing");
  const [timeframe, setTimeframe] = React.useState<string>("30m"); // Default to 30m
  const formRef = React.useRef<HTMLFormElement>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);

  // Auto‑focus the Title input when the dialog opens
  React.useEffect(() => {
    if (open && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(formRef.current!);
    const entry: NewEntryData = {
      title: fd.get("title") as string,
      symbol: fd.get("symbol") as string,
      side: side === "long" ? "Long" : "Short",
      price: fd.get("price") as string,
      notes: fd.get("notes") as string,
    };
    
    // Also include the new fields in the payload
    const enhancedEntry: NewJournalEntry = {
      title: entry.title,
      symbol: entry.symbol,
      side: side,
      style: style,
      timeframe: timeframe,
      entryPrice: parseFloat(entry.price) || undefined,
      notes: entry.notes,
    };
    
    await new Promise((r) => setTimeout(r, 500));
    onCreate?.(entry);
    setLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[78vh] overflow-y-auto">
        <DialogTitle className="sr-only">New Journal Entry</DialogTitle>
        <div className="w-full max-w-3xl box-border overflow-hidden rounded-2xl bg-white p-5 shadow-xl">
          <h3 className="font-mono text-[18px] font-semibold tracking-tight">
            New Journal Entry
          </h3>
          <p className="mt-2 font-mono text-[12px] text-neutral-500">
            Log a trade with the key details.
          </p>

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Title + Symbol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block font-mono text-[12px] text-neutral-500 mb-1">Title</label>
                  <input
                    className="w-full h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm focus:ring-2 focus:ring-neutral-800"
                    name="title"
                    placeholder="Breakout retest"
                    ref={titleRef}
                    required
                  />
                </div>
                <div className="min-w-0">
                  <label className="block font-mono text-[12px] text-neutral-500 mb-1">Symbol</label>
                  <input
                    className="w-full h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm focus:ring-2 focus:ring-neutral-800"
                    name="symbol"
                    placeholder="BTC/USDT"
                    required
                  />
                </div>
              </div>

              {/* Side / Style / Timeframe */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="min-w-0">
                  <label className="block font-mono text-[12px] text-neutral-500 mb-1">Side</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center h-8 px-3 rounded-lg border text-[12px] transition ${side === "long" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"}`}
                      onClick={() => setSide("long")}
                    >
                      Long
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center h-8 px-3 rounded-lg border text-[12px] transition ${side === "short" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"}`}
                      onClick={() => setSide("short")}
                    >
                      Short
                    </button>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block font-mono text-[12px] text-neutral-500 mb-1">Style</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center h-8 px-3 rounded-lg border text-[12px] transition ${style === "swing" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"}`}
                      onClick={() => setStyle("swing")}
                    >
                      Swing
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center h-8 px-3 rounded-lg border text-[12px] transition ${style === "scalp" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"}`}
                      onClick={() => setStyle("scalp")}
                    >
                      Scalp
                    </button>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block font-mono text-[12px] text-neutral-500 mb-1">Timeframe</label>
                  <div className="relative">
                    <select
                      name="timeframe"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 pr-9 text-sm appearance-none focus:ring-2 focus:ring-neutral-800"
                    >
                      <option value="1m">1m</option>
                      <option value="5m">5m</option>
                      <option value="15m">15m</option>
                      <option value="30m">30m</option>
                      <option value="1h">1h</option>
                      <option value="4h">4h</option>
                      <option value="1d">1d</option>
                      <option value="1w">1w</option>
                      <option value="1M">1M</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400">
                      ▾
                    </span>
                  </div>
                </div>
              </div>

              {/* Entry Price */}
              <div>
                <label className="block font-mono text-[12px] text-neutral-500 mb-1">Entry Price</label>
                <input
                  className="w-full h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm focus:ring-2 focus:ring-neutral-800"
                  name="price"
                  placeholder="42150.00"
                  inputMode="decimal"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-mono text-[12px] text-neutral-500 mb-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Setup, context, management…"
                  className="w-full h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm focus:ring-2 focus:ring-neutral-800 min-h-[120px] py-2"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-sm hover:bg-neutral-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  className="h-9 px-3 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800"
                  disabled={loading}
                >
                  {loading ? "Saving…" : "Save Entry"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}