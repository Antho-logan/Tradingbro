export type LearnItem = {
  slug: string;
  title: string;
  summary: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  topic: "Setup" | "Strategy" | "Risk" | "Psych" | "Journal" | "Playbooks";
  time: number; // minutes
  tags?: string[];
};

export const LEARN_TOPICS: LearnItem[] = [
  {
    slug: "risk-first-sane-sizing",
    title: "Risk-first: sane position sizing",
    summary: "A lightweight method to cap downside and normalize R across trades.",
    level: "Beginner",
    topic: "Risk",
    time: 8,
    tags: ["risk", "r-multiple", "stop"],
  },
  {
    slug: "journal-like-a-pro",
    title: "Journal like a pro (10 mins/day)",
    summary: "Minimal template to capture setup, context, management and outcome.",
    level: "Beginner",
    topic: "Journal",
    time: 6,
    tags: ["templates", "review"],
  },
  {
    slug: "pullback-playbook",
    title: "Playbook: trend pullback with confirmation",
    summary: "A rules-based entry with context, invalidation and scale-out logic.",
    level: "Intermediate",
    topic: "Playbooks",
    time: 12,
    tags: ["trend", "pullback", "rr"],
  },
  {
    slug: "higher-timeframe-bias",
    title: "Higher-timeframe bias in 90 seconds",
    summary: "Quick checklist to avoid fighting the tape.",
    level: "Beginner",
    topic: "Strategy",
    time: 5,
    tags: ["htf", "context"],
  },
  {
    slug: "psychology-losing-streaks",
    title: "Psych: handling losing streaks",
    summary: "Cut risk, cut frequency, keep data. A small protocol for ugly weeks.",
    level: "Intermediate",
    topic: "Psych",
    time: 7,
    tags: ["discipline", "protocol"],
  },
  {
    slug: "execution-checklist",
    title: "Execution checklist",
    summary: "Pre-trade, in-trade and post-trade checks to reduce errors.",
    level: "Advanced",
    topic: "Setup",
    time: 9,
    tags: ["checklist", "ops"],
  },
];