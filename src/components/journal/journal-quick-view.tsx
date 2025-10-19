"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type JournalItem = {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  note: string;
  pnlPct: number;     // e.g. +2.4 or -0.8
  ago: string;        // e.g. "2h ago"
  tags?: string[];
};

export function JournalQuickViewDialog({
  open,
  onOpenChange,
  items = [],
  onViewAll,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items?: JournalItem[];
  onViewAll?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // match Quick Peek container: white card, soft ring/shadow, rounded
          "max-w-2xl w-[720px] rounded-2xl bg-white",
          "ring-1 ring-black/5 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.25),0_8px_24px_-12px_rgba(0,0,0,0.15)]",
          // same entry animation profile as Quick Peek
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        )}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-[15px] font-semibold tracking-tight text-neutral-900">
            Quick Journal
          </DialogTitle>
          <p className="text-[12px] text-neutral-500">
            Recent trades & notes. Terminal vibes, crisp shadows.
          </p>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {items.map((it) => (
            <div
              key={it.id}
              className={cn(
                // light card like Quick Peek stat tiles
                "rounded-xl bg-white border border-neutral-200",
                "shadow-sm hover:shadow-md transition-shadow",
                "p-4"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="font-mono text-neutral-700">{it.symbol}</span>

                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-md border text-[11px] font-medium",
                        it.side === "LONG"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      )}
                    >
                      {it.side}
                    </span>

                    <div className="flex flex-wrap gap-1">
                      {it.tags?.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded-md text-[11px] text-neutral-700 bg-neutral-100 border border-neutral-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="mt-2 text-[13px] leading-snug text-neutral-800">
                    {it.note}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-400">
                    <span>{it.ago}</span>
                  </div>
                </div>

                <div
                  className={cn(
                    "ml-2 rounded-md px-2 py-1 text-[12px] font-semibold",
                    it.pnlPct >= 0
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                      : "text-rose-700 bg-rose-50 border border-rose-200"
                  )}
                >
                  {it.pnlPct >= 0 ? "+" : ""}
                  {it.pnlPct.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500 text-[13px]">
              No recent entries. Add trades in Journal.
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-lg px-3 text-[13px] bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onViewAll}
            className="h-9 rounded-lg px-3 text-[13px] bg-neutral-900 text-white hover:bg-black transition-colors"
          >
            View Journal
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}