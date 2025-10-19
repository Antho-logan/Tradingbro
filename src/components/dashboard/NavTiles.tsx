"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, NotebookText, BarChart3, BookOpen, Activity, Bot, Flame, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

type Tile =
  | { href: string; title: string; desc: string; icon: React.ReactNode; status?: "live" | "soon" }
  | { href?: undefined; title: string; desc: string; icon: React.ReactNode; status: "soon" };

const primaryTiles: Tile[] = [
  { href: "/chat",    title: "AI Trade Chat", desc: "Image-aware coaching.",           icon: <MessageSquare className="h-5 w-5" aria-hidden /> , status: "live"},
  { href: "/journal", title: "Journal",       desc: "Log trades & insights.",          icon: <NotebookText className="h-5 w-5" aria-hidden /> , status: "live"},
  { href: "/reports", title: "Reports",       desc: "Weekly performance & risk.",      icon: <BarChart3 className="h-5 w-5" aria-hidden /> ,   status: "live"},
  { href: "/learn",   title: "Learn",         desc: "Guides & references.",            icon: <BookOpen className="h-5 w-5" aria-hidden /> ,    status: "live"},
];

const proTiles: Tile[] = [
  { title: "Order Flow",     desc: "Tape/footprint & flow signals.",          icon: <Activity className="h-5 w-5" aria-hidden />, status: "soon" },
  { title: "Daily Trades",   desc: "AI bot drafts eligible trades daily.",    icon: <Bot className="h-5 w-5" aria-hidden />,      status: "soon" },
  { title: "Heat Maps",      desc: "Visualize hot/cold zones by session.",    icon: <Flame className="h-5 w-5" aria-hidden />,    status: "soon" },
  { title: "Incoming News",  desc: "Market-moving headlines feed.",           icon: <Newspaper className="h-5 w-5" aria-hidden />,status: "soon" },
];

function TileCard({ tile }: { tile: Tile }) {
  const body = (
    <Card
      className={cn(
        "card hover:shadow-lg transition relative",
        !("href" in tile) && "cursor-default opacity-95"
      )}
    >
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center gap-2 opacity-80">
          {tile.icon}
          <span className="sr-only">{tile.title} icon</span>
          {tile.status === "soon" && <Badge variant="secondary">Soon</Badge>}
        </div>
        <h3 className="text-base font-semibold tracking-tight">{tile.title}</h3>
        <p className="text-sm text-muted-foreground">{tile.desc}</p>
      </CardContent>
    </Card>
  );

  return "href" in tile && tile.href ? (
    <Link
      href={tile.href}
      className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl"
    >
      {body}
    </Link>
  ) : (
    <div aria-disabled className="rounded-2xl">{body}</div>
  );
}

export default function NavTiles() {
  return (
    <div className="space-y-6">
      {/* Primary shortcuts */}
      <div className="quick-actions grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryTiles.map((t) => (
          <TileCard key={t.title} tile={t} />
        ))}
      </div>

      {/* Pro tools row */}
      <div className="quick-actions grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {proTiles.map((t) => (
          <TileCard key={t.title} tile={t} />
        ))}
      </div>
    </div>
  );
}