/**
 * Global terminal vibe shell (light mode):
 * - Subtle neutral grid + soft vignette (no purple/teal)
 * - Very light scanlines
 * Server Component (no client JS).
 */
export default function TerminalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* neutral grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)",
          backgroundSize: "42px 42px, 42px 42px",
        }}
      />
      {/* soft vignette (neutral gray) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(0,0,0,0.06), transparent), radial-gradient(1000px 600px at 100% 0%, rgba(0,0,0,0.04), transparent)",
        }}
      />
      {/* scanlines */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "100% 3px",
          mixBlendMode: "multiply",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}