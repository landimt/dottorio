import { z } from "zod";

export const createExamSchema = z.object({
  subjectId: z.string().min(1, "Seleziona una materia"),
  professorId: z.string().min(1, "Seleziona un professore"),
  universityId: z.string().min(1, "Seleziona un'università"),
  channelId: z.string().optional(),
  year: z.number().int().min(1).max(6).optional(), // 1-6 anno
  date: z.string().optional(),
  notes: z.string().optional(),
});

export const updateExamSchema = createExamSchema.partial();

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
