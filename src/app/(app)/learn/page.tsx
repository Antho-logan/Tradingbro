"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LevelMenu } from "@/app/(app)/learn/components/level-menu";
import { Badge } from "@/components/ui/badge";
import { Filter, BookOpen, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEARN_TOPICS, LearnItem } from "@/lib/learn-data";

export default function LearnPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  
  // Helper to convert level values for comparison
  const normalizeLevel = (l: string) => {
    if (l === "all") return "All";
    return l.charAt(0).toUpperCase() + l.slice(1);
  };
  // Topic UI removed but logic defaults to "all"
  const topic = "all" as const;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return LEARN_TOPICS.filter((i) => {
      const byLevel = level === "all" || i.level === normalizeLevel(level);
      const byTopic = topic === "all" ? true : i.topic === topic;
      const byText =
        !term ||
        [i.title, i.summary, i.topic, i.level, ...(i.tags || [])].some((t) => t.toLowerCase().includes(term));
      return byLevel && byTopic && byText;
    });
  }, [q, level, topic]);

  return (
    <main className="relative">
      {/* page backdrop glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_30%_0%,rgba(0,0,0,0.05),transparent),radial-gradient(50%_30%_at_80%_10%,rgba(0,0,0,0.05),transparent)]" />

      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-3xl font-semibold tracking-tight">Learn</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Bite-size guides and playbooks. Terminal vibes, zero fluff.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/dashboard")}>Back</Button>
          <Button asChild>
            <Link href="/learn#tracks">Browse Tracks</Link>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        {/* Search | Level icon | Filter icon */}
        <div className="mb-6 grid grid-cols-1 md:[grid-template-columns:1fr_auto_auto] items-center justify-items-start gap-3">
          {/* Search grows; never overflows */}
          <div className="min-w-0 w-full md:max-w-[480px] lg:max-w-[560px]">
            <Input
              placeholder="Search topics, tags, or terms…"
              className="h-10 w-full min-w-0"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Level icon-only menu */}
          <div className="justify-self-end">
            <LevelMenu value={level} onChange={setLevel} />
          </div>

          {/* Existing Filter dropdown (KEEP your current menu; only ensure icon-only trigger if not already) */}
          <div className="justify-self-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 p-0 rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 inline-flex items-center justify-center">
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Filter</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => {}}>All Topics</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Setup</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Strategy</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Risk</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Psych</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Journal</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Playbooks</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Featured band */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <Card className="rounded-2xl border bg-white">
          <CardContent className="p-0">
            <div className="mx-auto w-full max-w-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-mono text-sm text-neutral-700">trade@terminal — ~/learn</p>
                <h2 className="mt-2 text-xl font-semibold">Start here: Core concepts for consistency</h2>
                <p className="mt-1 text-sm text-neutral-600">Risk first, plan second, execution last. Three short guides.</p>
              </div>
              <Link href="/learn/quick-start" className="inline-flex items-center justify-center h-9 rounded-lg px-3 bg-neutral-900 text-white hover:bg-neutral-800">
                Open Quick Start
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Grid */}
      <section id="tracks" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {filtered.map((i) => (
            <div key={i.slug} className="h-auto md:h-[264px]">
              <ArticleCard item={i} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 text-center font-mono text-sm text-neutral-500">
            No matches. Try clearing filters.
          </div>
        )}
      </section>
    </main>
  );
}

function ArticleCard({ item }: { item: LearnItem }) {
  return (
    <Link href={`/learn/${item.slug}`} className="group">
      <Card
        className={cn(
          "h-full border-neutral-200 shadow-sm transition-all duration-300",
          "hover:shadow-md hover:-translate-y-0.5"
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="font-semibold">{item.title}</span>
            <Badge variant="secondary" className="font-mono">{item.level}</Badge>
          </CardTitle>
          <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{item.topic}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.time}m</span>
          </div>
        </CardHeader>
        <CardContent className="h-full p-4 overflow-hidden flex flex-col min-h-0">
          <div className="flex h-full flex-col">
            <p className="mt-1 text-sm text-neutral-700 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
              {item.summary}
            </p>
            <div className="mt-1 flex flex-wrap gap-1 max-h-[28px] overflow-hidden">
              {item.tags?.slice(0, 3).map((t) => (
                <Badge key={t} variant="outline" className="font-mono">{t}</Badge>
              ))}
            </div>
            <div className="mt-auto pt-1 inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
              Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}