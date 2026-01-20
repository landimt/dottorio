import { z } from "zod";

export const createShareLinkSchema = z.object({
  examId: z.string().uuid("ID esame non valido"),
});

export const getShareLinkSchema = z.object({
  slug: z.string().min(1, "Slug obbligatorio"),
});

export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
export type GetShareLinkInput = z.infer<typeof getShareLinkSchema>;
