import { Prisma } from "@prisma/client";

/**
 * Reusable Prisma include configurations
 * Centralizes common include patterns to avoid duplication
 */

// ============================================================================
// User Includes
// ============================================================================

export const userSummarySelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

export const userDetailSelect = {
  ...userSummarySelect,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

// ============================================================================
// University/Subject/Professor Includes
// ============================================================================

export const universityInclude = {
  _count: {
    select: {
      professors: true,
      users: true,
      channels: true,
    },
  },
} satisfies Prisma.UniversityInclude;

export const subjectInclude = {
  _count: {
    select: {
      professors: true,
      exams: true,
    },
  },
} satisfies Prisma.SubjectInclude;

export const professorInclude = {
  university: true,
  subjects: {
    include: {
      subject: true,
    },
  },
  _count: {
    select: {
      exams: true,
    },
  },
} satisfies Prisma.ProfessorInclude;

// ============================================================================
// Exam Includes
// ============================================================================

export const examBaseInclude = {
  subject: true,
  professor: true,
  university: true,
} satisfies Prisma.ExamInclude;

export const examWithCreatorInclude = {
  ...examBaseInclude,
  creator: {
    select: userSummarySelect,
  },
} satisfies Prisma.ExamInclude;

export const examFullInclude = {
  ...examWithCreatorInclude,
  _count: {
    select: {
      questions: true,
    },
  },
} satisfies Prisma.ExamInclude;

// ============================================================================
// Question Includes
// ============================================================================

export const questionListInclude = {
  exam: {
    include: examWithCreatorInclude,
  },
  _count: {
    select: {
      studentAnswers: true,
      comments: true,
      savedBy: true,
    },
  },
} satisfies Prisma.QuestionInclude;

export function questionListWithSavedInclude(userId?: string) {
  return {
    ...questionListInclude,
    savedBy: userId
      ? {
          where: { userId },
          select: { id: true },
        }
      : false,
  } satisfies Prisma.QuestionInclude;
}

export function questionDetailInclude(userId?: string) {
  return {
    exam: {
      include: {
        ...examWithCreatorInclude,
        creator: {
          select: {
            ...userSummarySelect,
            email: true,
          },
        },
      },
    },
    aiAnswer: true,
    studentAnswers: {
      include: {
        user: {
          select: userSummarySelect,
        },
        _count: {
          select: { likes: true },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" as const },
    },
    comments: {
      include: {
        user: {
          select: userSummarySelect,
        },
        _count: {
          select: { likes: true },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: "asc" as const },
    },
    savedBy: userId
      ? {
          where: { userId },
          select: { id: true },
        }
      : false,
    _count: {
      select: {
        studentAnswers: true,
        comments: true,
        savedBy: true,
      },
    },
  } satisfies Prisma.QuestionInclude;
}

// ============================================================================
// Admin Includes
// ============================================================================

export const adminUserInclude = {
  university: true,
  channel: true,
  _count: {
    select: {
      exams: true,
      studentAnswers: true,
      comments: true,
    },
  },
} satisfies Prisma.UserInclude;

export const adminQuestionInclude = {
  exam: {
    include: examBaseInclude,
  },
  canonical: true,
  _count: {
    select: {
      variations: true,
      studentAnswers: true,
      comments: true,
    },
  },
} satisfies Prisma.QuestionInclude;
