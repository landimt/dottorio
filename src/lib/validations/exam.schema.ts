import { z } from "zod";

export const createExamSchema = z.object({
  subjectId: z.string().uuid("Seleziona una materia valida"),
  professorId: z.string().uuid("Seleziona un professore valido"),
  universityId: z.string().uuid("Seleziona un'università valida"),
  courseId: z.string().uuid("Seleziona un corso valido").optional(),
  year: z.number().int().min(1).max(6).optional(), // 1-6 anno
  date: z.string().optional(),
  notes: z.string().optional(),
});

export const updateExamSchema = createExamSchema.partial();

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
