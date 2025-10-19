import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEARN_TOPICS } from "@/lib/learn-data";

type Props = { params: { slug: string } };

export default function LearnArticle({ params }: Props) {
  const item = LEARN_TOPICS.find((i) => i.slug === params.slug);
  if (!item) return notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="outline"><Link href="/learn">Back</Link></Button>
        <Badge variant="secondary" className="font-mono">{item.level}</Badge>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{item.title}</CardTitle>
          <p className="mt-2 text-sm text-neutral-600">{item.summary}</p>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none">
          {/* Placeholder content; we'll replace with real copy later */}
          <h3>Overview</h3>
          <p>This is a demo article shell. We&apos;ll plug in the real content (or MDX later) without new deps for now.</p>
          <h3>Key Steps</h3>
          <ol>
            <li>Context / pre-trade checks</li>
            <li>Rules / triggers</li>
            <li>Risk / invalidation</li>
            <li>Management / exits</li>
          </ol>
          <p className="text-sm text-neutral-500">Tags: {item.tags?.join(", ")}</p>
        </CardContent>
      </Card>
    </main>
  );
}