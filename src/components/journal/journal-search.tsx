"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type JournalSearchProps = {
  value?: string;
  onChange?: (v: string) => void;
  onFilterChange?: (f: { wins: boolean; losses: boolean; long: boolean; short: boolean }) => void;
  className?: string;
};

export function JournalSearch({
  value = "",
  onChange,
  onFilterChange,
  className,
}: JournalSearchProps) {
  const [query, setQuery] = useState(value);
  const [filters, setFilters] = useState({ wins: true, losses: true, long: true, short: true });

  const update = (patch: Partial<typeof filters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFilterChange?.(next);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3",
        className
      )}
      role="search"
      aria-label="Search journal"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder="Search symbol, notes, or tags…"
          className="pl-9 font-mono"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="font-mono gap-2 border-border shadow-sm hover:bg-accent/40"
            aria-label="Open filters"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 font-mono">
          <DropdownMenuLabel>Result filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filters.wins}
            onCheckedChange={(v) => update({ wins: Boolean(v) })}
          >
            Wins
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.losses}
            onCheckedChange={(v) => update({ losses: Boolean(v) })}
          >
            Losses
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.long}
            onCheckedChange={(v) => update({ long: Boolean(v) })}
          >
            Long
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.short}
            onCheckedChange={(v) => update({ short: Boolean(v) })}
          >
            Short
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}