export const landingCopy = {
  hero: {
    title: "You've lost enough.\nLearn to trade — with an AI coach.",
    subtitle:
      "TraderBro reads your chart screenshots, asks the right follow-ups, and drafts step-by-step plans you can execute and journal.",
    ctas: [
      { label: "Get Started", href: "/sign-up", variant: "default", note: "No credit card. ~2 min setup." },
      { label: "Sign In", href: "/sign-in", variant: "secondary" }
    ],
    terminalCaption:
      "$ analyze_chart --symbol=BTCUSDT · signal detected · plan drafted · risks mapped"
  },
  howItWorks: [
    { title: "Drop a chart", body: "Paste or upload a screenshot. We parse PA, levels, and context." },
    { title: "Get a plan", body: "Clear entry/invalidations, risk, and management—plus quick 'why' notes." },
    { title: "Execute & learn", body: "Log trades in one click and review what moved P&L each week." }
  ],
  features: [
    { title: "AI Trade Chat", body: "Image-aware coaching. Upload a chart, get a plan, iterate with follow-ups." },
    { title: "Journal", body: "Log trades & insights fast. Tag setups, attach images, keep a clean trail." },
    { title: "Reports", body: "Weekly performance & risk with actionable AI focus notes." },
    { title: "Learn", body: "Guides & references. Playbooks, pattern primers, risk templates." },
    { title: "Order Flow (Soon)", body: "Tape/footprint & flow signals summarized into plain English." },
    { title: "Daily Trades (Soon)", body: "AI drafts eligible setups each day—start with a shortlist." },
    { title: "Heat Maps (Soon)", body: "Hot/cold zones by session. See where you perform." },
    { title: "Incoming News (Soon)", body: "Market-moving headlines with quick impact context." }
  ],
  valueProps: [
    "Terminal-first UX. Minimal, crisp, fast.",
    "Image-aware: real chart screenshots, not just text prompts.",
    "Coaching loop: plan → execute → journal → report → adjust.",
    "Own your data. Export anytime."
  ],
  footerCta: { title: "Ready to trade smarter?", subtitle: "Get a plan, not a hunch." }
} as const;