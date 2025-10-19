"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Filter, BookOpen, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEARN_TOPICS, LearnItem } from "@/lib/learn-data";

export default function LearnPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [topic, setTopic] = useState<"All" | "Setup" | "Strategy" | "Risk" | "Psych" | "Journal" | "Playbooks">("All");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return LEARN_TOPICS.filter((i) => {
      const byLevel = level === "All" || i.level === level;
      const byTopic = topic === "All" || i.topic === topic;
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
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Back</Button>
          <Button asChild>
            <Link href="/learn#tracks">Browse Tracks</Link>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search topics, tags, or terms…"
            className="h-10 font-mono"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10">
                Level: <span className="ml-2 font-mono">{level}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {(["All","Beginner","Intermediate","Advanced"] as const).map(l => (
                <DropdownMenuItem key={l} onClick={() => setLevel(l)}>{l}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10">
                <Filter className="mr-2 h-4 w-4" /> Topic: <span className="ml-2 font-mono">{topic}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(["All","Setup","Strategy","Risk","Psych","Journal","Playbooks"] as const).map(t => (
                <DropdownMenuItem key={t} onClick={() => setTopic(t)}>{t}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Featured band */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-mono text-sm text-neutral-700">trade@terminal — ~/learn</p>
              <h2 className="mt-2 text-xl font-semibold">Start here: Core concepts for consistency</h2>
              <p className="mt-1 text-sm text-neutral-600">Risk first, plan second, execution last. Three short guides.</p>
            </div>
            <Button asChild>
              <Link href="#core">Open Quick Start</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Grid */}
      <section id="tracks" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => (
            <ArticleCard key={i.slug} item={i} />
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
          "border-neutral-200 shadow-sm transition-all duration-300",
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
        <CardContent className="pt-0">
          <p className="text-sm text-neutral-700">{item.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags?.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="font-mono">{t}</Badge>
            ))}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
            Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}