import { z } from "zod";

// ============================================
// CONSTANTS
// ============================================

const MAX_CONTENT_SIZE = 5 * 1024 * 1024; // 5MB max content
const MAX_PAGES_PER_NOTEBOOK = 500;
const MAX_ORDER = 10000;

// ============================================
// HELPER SCHEMAS
// ============================================

// Hex color validation (optional)
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
  .optional()
  .nullable();

// ProseMirror JSON content schema (basic validation)
const proseMirrorContentSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(z.any()).optional(),
  })
  .passthrough() // Allow additional ProseMirror properties
  .optional()
  .nullable();

// Content size validation
const contentSizeValidation = (content: unknown): boolean => {
  if (!content) return true;
  const size = JSON.stringify(content).length;
  return size <= MAX_CONTENT_SIZE;
};

// ============================================
// NOTEBOOK SCHEMAS
// ============================================

export const createNotebookSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(150, "Title must be at most 150 characters"),
  subject: z
    .string()
    .max(100, "Subject must be at most 100 characters")
    .optional()
    .nullable(),
  icon: z
    .string()
    .max(10)
    .default("📓"),
  color: hexColorSchema,
});

export const updateNotebookSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(150, "Title must be at most 150 characters")
    .optional(),
  subject: z
    .string()
    .max(100, "Subject must be at most 100 characters")
    .optional()
    .nullable(),
  icon: z
    .string()
    .max(10)
    .optional(),
  color: hexColorSchema,
});

// ============================================
// PAGE SCHEMAS
// ============================================

export const createPageSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  content: proseMirrorContentSchema.refine(contentSizeValidation, {
    message: `Content exceeds maximum size of ${MAX_CONTENT_SIZE / 1024 / 1024}MB`,
  }),
  contentHtml: z
    .string()
    .max(MAX_CONTENT_SIZE, "HTML content too large")
    .optional()
    .nullable(),
  order: z
    .number()
    .int()
    .min(0)
    .max(MAX_ORDER, `Order must be at most ${MAX_ORDER}`)
    .optional(),
  wordCount: z.number().int().min(0).optional(),
  characterCount: z.number().int().min(0).optional(),
});

export const updatePageSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  content: proseMirrorContentSchema.refine(contentSizeValidation, {
    message: `Content exceeds maximum size of ${MAX_CONTENT_SIZE / 1024 / 1024}MB`,
  }),
  contentHtml: z
    .string()
    .max(MAX_CONTENT_SIZE, "HTML content too large")
    .optional()
    .nullable(),
  order: z
    .number()
    .int()
    .min(0)
    .max(MAX_ORDER, `Order must be at most ${MAX_ORDER}`)
    .optional(),
  wordCount: z.number().int().min(0).optional(),
  characterCount: z.number().int().min(0).optional(),
  version: z.number().int().min(1).optional(), // For optimistic locking
});

// ============================================
// QUERY SCHEMAS
// ============================================

export const listNotebooksQuerySchema = z.object({
  includeDeleted: z.boolean().optional().default(false),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export const listPagesQuerySchema = z.object({
  includeDeleted: z.boolean().optional().default(false),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

// ============================================
// TYPES
// ============================================

export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;
export type UpdateNotebookInput = z.infer<typeof updateNotebookSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type ListNotebooksQuery = z.infer<typeof listNotebooksQuerySchema>;
export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>;

// ProseMirror JSON type for TypeScript
export interface ProseMirrorDoc {
  type: "doc";
  content?: ProseMirrorNode[];
}

export interface ProseMirrorNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: ProseMirrorNode[];
  marks?: ProseMirrorMark[];
  text?: string;
}

export interface ProseMirrorMark {
  type: string;
  attrs?: Record<string, unknown>;
}

// ============================================
// CONSTANTS EXPORT
// ============================================

export const NOTEBOOK_LIMITS = {
  MAX_CONTENT_SIZE,
  MAX_PAGES_PER_NOTEBOOK,
  MAX_ORDER,
} as const;
