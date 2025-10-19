import { cn } from "@/lib/utils";

type Variant = "default" | "frameless";

export default function TerminalWindow({
  title = "trader@terminal — ~/analysis",
  className,
  headerClassName,
  variant = "default",
  showHeader = true,
  hideHeader = false,
  children,
}: {
  title?: string;
  className?: string;
  headerClassName?: string;
  variant?: Variant;
  showHeader?: boolean;
  /** If true, removes the header bar entirely (no traffic lights). */
  hideHeader?: boolean;
  children: React.ReactNode;
}) {
  const isFrameless = variant === "frameless";
  const renderHeader = showHeader && !isFrameless && !hideHeader;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        !isFrameless && !hideHeader &&
          "border border-border bg-card ring-1 ring-black/5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.15)]",
        (isFrameless || hideHeader) && "border border-border bg-card ring-1 ring-black/5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.15)]",
        className
      )}
    >
      {renderHeader && (
        <div
          className={cn(
            "flex items-center gap-2 border-b border-border bg-background px-3 py-2",
            headerClassName
          )}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="ml-3 text-xs text-muted-foreground">{title}</span>
        </div>
      )}
      <div className="bg-card p-3 sm:p-4">{children}</div>
    </div>
  );
}