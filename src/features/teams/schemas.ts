import { z } from "zod";

export const teamFormSchema = z.object({
  name: z.string().trim().min(1, "Team name is required").max(100),
  description: z.string().max(500).default(""),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
export type TeamFormInput = z.input<typeof teamFormSchema>;
