"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EntryCard, JournalEntry } from "@/components/journal/entry-card";
import { NewEntryDialog } from "@/components/journal/new-entry-dialog";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DEMO: JournalEntry[] = [
  {
    id: "1",
    symbol: "BTC/USDT",
    side: "Long",
    win: true,
    rr: 3.2,
    pnlPct: 6.4,
    timestamp: "10/17/2025 09:48 PM",
    tags: ["breakout", "4h", "RSI"],
    note: "Breakout retest on 4h, volume confirmation, RSI bullish divergence.",
  },
  {
    id: "2",
    symbol: "ETH/USDT",
    side: "Short",
    win: false,
    rr: 1.0,
    pnlPct: -1.1,
    timestamp: "10/17/2025 06:48 PM",
    tags: ["counter-trend", "resistance"],
    note: "Counter-trend setup at resistance, failed breakdown.",
  },
  {
    id: "3",
    symbol: "SOL/USDT",
    side: "Long",
    win: true,
    rr: 2.0,
    pnlPct: 4.2,
    timestamp: "10/16/2025 11:48 PM",
    tags: ["triangle", "breakout", "partials"],
    note: "Ascending triangle, breakout with volume, took partials at +2R.",
  },
];

export default function JournalPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>(DEMO);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.symbol, e.note, ...e.tags].some((v) => v.toLowerCase().includes(q))
    );
  }, [entries, query]);

  return (
    <main className={cn("bg-neutral-50 text-neutral-900 px-6 py-8 sm:px-8 sm:py-10")}>
      {/* HEADER: Back + Title + New Entry */}
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="no-ring"
            onClick={() => {
              console.log("Back button clicked");
              router.push("/dashboard");
            }}
          >
            Back
          </Button>
          <h1 className="text-xl font-bold">Journal</h1>
        </div>
        
        <Button
          size="sm"
          className="no-ring"
          onClick={() => setNewEntryOpen(true)}
        >
          New Entry
        </Button>
      </div>

      {/* Search + Filters */}
      <section className="mx-auto max-w-6xl mb-6">
        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, notes, or tags…"
            className="h-10 font-mono flex-1"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="no-ring" aria-label="Filters">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setQuery("long")}>Side: Long</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuery("short")}>Side: Short</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuery("win")}>Result: Win</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuery("loss")}>Result: Loss</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuery("")}>Clear</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* List */}
      <section className="mx-auto max-w-6xl pb-12">
        {filtered.length === 0 ? (
          <Card className="rounded-2xl border border-neutral-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
            <div className="p-10 text-center font-mono text-sm text-neutral-500">
              Journal entries will appear here…
            </div>
          </Card>
        ) : (
          <div className="space-y-5">
            {filtered.map((e) => (
              <EntryCard key={e.id} e={e} />
            ))}
          </div>
        )}
      </section>

      <NewEntryDialog
        open={newEntryOpen}
        onOpenChange={setNewEntryOpen}
        onCreate={(entry) => {
          const newEntry: JournalEntry = {
            id: Date.now().toString(),
            symbol: entry.symbol,
            side: entry.side,
            win: Math.random() > 0.5, // Random demo value
            rr: 1.5, // Demo value
            pnlPct: Math.random() > 0.5 ? Math.random() * 5 : -Math.random() * 3, // Demo value
            timestamp: new Date().toLocaleString("en-US", {
              month: "numeric",
              day: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit"
            }),
            tags: [],
            note: entry.notes
          };
          setEntries([newEntry, ...entries]);
          toast.success("Entry saved!");
        }}
      />
    </main>
  );
}