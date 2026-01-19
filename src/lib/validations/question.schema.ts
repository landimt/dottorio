import { z } from "zod";

export const createQuestionSchema = z.object({
  examId: z.string().min(1, "Seleziona un esame"),
  text: z.string().min(10, "La domanda deve avere almeno 10 caratteri"),
});

export const updateQuestionSchema = z.object({
  text: z.string().min(10, "La domanda deve avere almeno 10 caratteri").optional(),
});

export const searchQuestionsSchema = z.object({
  query: z.string().optional(),
  subjectId: z.string().optional(),
  professorId: z.string().optional(),
  universityId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type SearchQuestionsInput = z.infer<typeof searchQuestionsSchema>;
