import { z } from "zod";

export const targetSchema = z.object({
  rr: z.number().positive().optional(),
  price: z.number().optional(),
  note: z.string().optional(),
});

export const suggestionSchema = z.object({
  side: z.enum(["long", "short"]),
  entry: z.object({
    zone: z.tuple([z.number(), z.number()]).or(z.array(z.number()).length(2)),
    rationale: z.string().optional(),
  }),
  invalidation: z.object({
    price: z.number(),
    rationale: z.string().optional(),
  }),
  targets: z.array(targetSchema).min(1),
});

export const tradePlanSchema = z.object({
  meta: z.object({
    instrument: z.string().optional(),
    timeframe: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  }),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    options: z.array(z.string()).optional(),
  })).optional().default([]),
  suggestions: z.array(suggestionSchema).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
});

export type TradePlanIO = z.infer<typeof tradePlanSchema>;