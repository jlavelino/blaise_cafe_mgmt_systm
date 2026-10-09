import { z } from "zod";

export const SubmitDailyClosingSchema = z.object({
  actualCash: z.number().min(0, "Actual cash counted cannot be negative"),
  notes: z.string().max(255).optional()
});

export type SubmitDailyClosingInput = z.infer<typeof SubmitDailyClosingSchema>;
