import { z } from "zod";

// ============================================================================
// University Schemas
// ============================================================================

export const createUniversitySchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri").max(200),
  shortName: z.string().max(50).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
});

export const updateUniversitySchema = createUniversitySchema.partial();

export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
export type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;

// ============================================================================
// Subject Schemas
// ============================================================================

export const createSubjectSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri").max(200),
  emoji: z.string().max(10).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

// ============================================================================
// Professor Schemas
// ============================================================================

export const createProfessorSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri").max(200),
  universityId: z.string().uuid().optional().nullable(),
  subjectIds: z.array(z.string().uuid()).optional(),
});

export const updateProfessorSchema = createProfessorSchema.partial();

export type CreateProfessorInput = z.infer<typeof createProfessorSchema>;
export type UpdateProfessorInput = z.infer<typeof updateProfessorSchema>;

// ============================================================================
// User Schemas
// ============================================================================

export const updateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.enum(["student", "representative", "admin", "super_admin"]).optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================================================
// Content Flag Schemas
// ============================================================================

export const reviewContentFlagSchema = z.object({
  status: z.enum(["reviewed", "dismissed", "deleted"]),
  action: z.string().max(50).optional(),
});

export type ReviewContentFlagInput = z.infer<typeof reviewContentFlagSchema>;
