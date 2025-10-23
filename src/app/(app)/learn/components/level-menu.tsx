"use client";
import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, Layers } from "lucide-react";

type LevelValue = "all" | "beginner" | "intermediate" | "advanced";

export function LevelMenu({
  value,
  onChange,
}: {
  value: LevelValue;
  onChange: (v: LevelValue) => void;
}) {
  const items: LevelValue[] = ["all", "beginner", "intermediate", "advanced"];
  const label = (v: LevelValue) =>
    v === "all" ? "Level: All" : v.charAt(0).toUpperCase() + v.slice(1);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="h-9 w-9 p-0 rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 inline-flex items-center justify-center"
        aria-label={label(value)}
      >
        <Layers className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{label(value)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        {items.map((v) => (
          <DropdownMenuItem
            key={v}
            onSelect={(e) => {
              e.preventDefault();
              onChange(v);
            }}
            className="flex items-center justify-between"
          >
            <span>{label(v)}</span>
            {value === v ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}