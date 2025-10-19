import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function MetricCard({
  title,
  value,
  note,
  href,
  className,
}: {
  title: string;
  value: React.ReactNode;
  note?: string;
  href?: string;
  className?: string;
}) {
  const Inner = (
    <Card
      className={cn(
        "card bg-card border-border hover:shadow-lg transition",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {note && <div className="mt-1 text-xs text-muted-foreground">{note}</div>}
      </CardContent>
    </Card>
  );
  return href ? (
    <Link
      href={href}
      className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl"
    >
      {Inner}
    </Link>
  ) : (
    Inner
  );
}