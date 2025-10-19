import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  pain, promise, how, features, social, cta
} from "./landing-copy";

export const metadata = {
  title: "TraderBro — AI trading coach that reads your charts",
  description: "Stop guessing. Upload any chart screenshot. Get a clear plan with entry, exit, risk, and position size. Then journal it in one click."
};

export default function LandingPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 lg:px-8">
      {/* === Hero ============================================= */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-20 md:pt-24 lg:pt-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
          {/* Left: copy */}
          <div>
            <h1 className="font-mono font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
              You've lost enough.<br />
              Learn to trade —<br />
              with an AI coach.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-600 font-mono">
              TraderBro reads your chart screenshots, asks the right follow-ups, and drafts step-by-step
              plans you can execute and journal.
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="/signup"
                className="inline-flex items-center rounded-xl bg-neutral-900 px-4 py-2.5 text-white font-mono text-[14px] leading-none shadow-sm hover:opacity-95 active:opacity-90 focus:outline-none focus-visible:ring-0"
              >
                Get Started
              </a>
              <a
                href="/auth/signin"
                className="inline-flex items-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 font-mono text-[14px] leading-none shadow-sm hover:bg-neutral-50 active:bg-neutral-100 focus:outline-none focus-visible:ring-0"
              >
                Sign In
              </a>
            </div>
            <p className="mt-4 text-[13px] font-mono text-neutral-500">
              Get a plan, not a hunch.
            </p>
          </div>

          {/* Right: terminal mock (reuse your existing component/content here) */}
          <div className="lg:mt-16 lg:translate-y-2">
            {/* Keep your existing terminal mock markup exactly as it is.
                Only the wrapper classes above changed to lower it visually. */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)]">
              <div className="rounded-xl bg-neutral-900 p-3">
                {/* Top bar */}
                <div className="h-6 w-full rounded-md bg-neutral-800/70" />
                {/* Chart area */}
                <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3">
                  <div className="aspect-[16/9] w-full rounded-lg bg-neutral-950" />
                </div>
                {/* Footer line */}
                <div className="mt-3 h-4 w-2/3 rounded bg-neutral-800" />
              </div>
            </div>
            <div className="mt-2 select-none font-mono text-[11px] text-neutral-400">
              $ analyze_chart —symbol=BTCUSDT · signal detected · plan drafted · risks mapped
            </div>
          </div>
        </div>
      </section>

      {/* === Pain → Promise =================================== */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-10 md:pt-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.2)]">
            <h3 className="font-mono font-semibold text-[15px] tracking-tight text-neutral-900">
              Why most traders stall
            </h3>
            <ul className="mt-4 space-y-3 text-[14px] font-mono text-neutral-600">
              <li>Entries without invalidations → revenge trades.</li>
              <li>Risk sizing drifts higher in drawdowns.</li>
              <li>Journals become a diary of shame—no feedback loop.</li>
              <li>Chasing & FOMO replace context and rules.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.2)]">
            <h3 className="font-mono font-semibold text-[15px] tracking-tight text-neutral-900">
              What flips the curve
            </h3>
            <ul className="mt-4 space-y-3 text-[14px] font-mono text-neutral-600">
              <li>Every chart → a 3-step plan (entry, invalidations, management).</li>
              <li>Risk templated to your tolerance; no "feels."</li>
              <li>Auto-journaled context → weekly AI focus notes.</li>
              <li>Terminal-first UX: crisp, fast, friction-free.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16">
        <h2 className="text-2xl font-semibold">{how.heading}</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {how.items.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.15)] p-6">
              <div className="text-lg font-medium">{item.title}</div>
              <p className="mt-2 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-16">
        <h2 className="text-2xl font-semibold">{features.heading}</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.items.map((f, i) => (
            <div key={i} className="rounded-2xl bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.15)] p-6">
              <div className="text-base font-medium">{f.title}</div>
              <p className="mt-2 text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY TRADERS STAY */}
      <section className="py-16">
        <h2 className="text-xl font-semibold">Why traders stay</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-1">
          <li className="text-sm text-muted-foreground">• Terminal-first UX. Crisp, fast, no fluff.</li>
          <li className="text-sm text-muted-foreground">• Coaching loop: plan → execute → journal → report → adjust.</li>
          <li className="text-sm text-muted-foreground">• Own your data. Export anytime.</li>
        </ul>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16">
        <div className="rounded-2xl bg-neutral-900 text-neutral-200 p-8 text-center">
          <div className="text-3xl font-bold">{social.count}</div>
          <div className="mt-2 text-lg">{social.label}</div>
          <div className="mt-1 text-sm opacity-70">{social.heading}</div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16">
        <div className="rounded-2xl bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.15)] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold">{cta.heading}</h3>
            <p className="text-muted-foreground mt-2">{cta.sub}</p>
          </div>
          <div className="flex gap-3">
            {cta.ctas.map((c) => (
              <Button
                key={c.label}
                asChild
                variant={c.variant === 'default' ? 'default' : 'outline'}
                className="h-10 px-4 font-mono no-ring"
              >
                <Link href={c.href}>{c.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}