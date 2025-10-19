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
      <DialogContent className="w-full max-w-2xl md:max-w-3xl rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] p-5 sm:p-6 max-h-[78vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">New Journal Entry</DialogTitle>
          <DialogDescription className="text-sm">
            Log a trade with the key details.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4 px-0">
          {/* Row 1: Title and Symbol */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="max-w-sm space-y-2">
              <Label htmlFor="title" className="mb-1 text-xs font-semibold text-neutral-600">Title</Label>
              <Input
                id="title"
                name="title"
                ref={titleRef}
                placeholder="Breakout retest"
                className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-mono no-ring"
                required
              />
            </div>

            {/* Symbol */}
            <div className="max-w-sm space-y-2">
              <Label htmlFor="symbol" className="mb-1 text-xs font-semibold text-neutral-600">Symbol</Label>
              <Input
                id="symbol"
                name="symbol"
                placeholder="BTC/USDT"
                className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-mono no-ring"
                required
              />
            </div>
          </div>

          {/* Row 2: Side / Style / Timeframe */}
          <div className="space-y-2 px-0">
            <Label className="mb-1 text-xs font-semibold text-neutral-600">Trade Details</Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Side */}
              <div>
                <Label className="mb-1 text-xs font-semibold text-neutral-600">Side</Label>
                <SegmentedToggle
                  name="side"
                  value={side}
                  onChange={(value) => setSide(value as "long" | "short")}
                  options={[
                    { value: "long", label: "Long" },
                    { value: "short", label: "Short" },
                  ]}
                />
              </div>

              {/* Style */}
              <div>
                <Label className="mb-1 text-xs font-semibold text-neutral-600">Style</Label>
                <SegmentedToggle
                  name="style"
                  value={style}
                  onChange={(value) => setStyle(value as "swing" | "scalp")}
                  options={[
                    { value: "swing", label: "Swing" },
                    { value: "scalp", label: "Scalp" },
                  ]}
                />
              </div>

              {/* Timeframe */}
              <div>
                <Label className="mb-1 text-xs font-semibold text-neutral-600">Timeframe</Label>
                <TimeframeSelect
                  value={timeframe}
                  onChange={setTimeframe}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Entry Price */}
          <div className="max-w-sm space-y-2 px-0">
            <Label htmlFor="price" className="mb-1 text-xs font-semibold text-neutral-600">Entry Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="42150.00"
              className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-mono no-ring"
            />
          </div>

          {/* Row 4: Notes */}
          <div className="space-y-2 px-0">
            <Label htmlFor="notes" className="mb-1 text-xs font-semibold text-neutral-600">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Setup, context, management…"
              className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-mono no-ring resize-none min-h-28"
              rows={4}
            />
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-neutral-200/70 flex items-center justify-end gap-3">
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="font-mono no-ring" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="h-9 rounded-xl bg-neutral-900 px-4 text-white hover:bg-neutral-900/90 font-mono no-ring"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Saving…" : "Save Entry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}