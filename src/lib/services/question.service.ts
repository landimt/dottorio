import prisma from "@/lib/prisma";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  SearchQuestionsInput,
} from "@/lib/validations/question.schema";

export const questionService = {
  async search(params: SearchQuestionsInput, userId?: string) {
    const { query, subjectId, professorId, universityId, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query) {
      where.text = {
        contains: query,
        mode: "insensitive",
      };
    }

    if (subjectId) {
      where.exam = {
        ...((where.exam as object) || {}),
        subjectId,
      };
    }

    if (professorId) {
      where.exam = {
        ...((where.exam as object) || {}),
        professorId,
      };
    }

    if (universityId) {
      where.exam = {
        ...((where.exam as object) || {}),
        universityId,
      };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          exam: {
            include: {
              subject: true,
              professor: true,
              university: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              studentAnswers: true,
              comments: true,
              savedBy: true,
            },
          },
          savedBy: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return {
      questions: questions.map((q) => ({
        ...q,
        isSaved: userId ? q.savedBy && q.savedBy.length > 0 : false,
        savedBy: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string, userId?: string) {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        aiAnswer: true,
        studentAnswers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
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
          orderBy: { createdAt: "desc" },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
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
          orderBy: { createdAt: "asc" },
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
      },
    });

    if (!question) return null;

    return {
      ...question,
      isSaved: userId ? question.savedBy && question.savedBy.length > 0 : false,
      studentAnswers: question.studentAnswers.map((a) => ({
        ...a,
        isLiked: userId ? a.likes && a.likes.length > 0 : false,
        likes: undefined,
      })),
      comments: question.comments.map((c) => ({
        ...c,
        isLiked: userId ? c.likes && c.likes.length > 0 : false,
        likes: undefined,
      })),
      savedBy: undefined,
    };
  },

  async create(data: CreateQuestionInput, userId: string) {
    // Verify exam ownership
    const exam = await prisma.exam.findFirst({
      where: { id: data.examId, createdBy: userId },
    });

    if (!exam) {
      throw new Error("Esame non trovato o non autorizzato");
    }

    // Generate a unique ID for the question first, so we can use it as groupId
    const questionId = crypto.randomUUID();

    return prisma.question.create({
      data: {
        id: questionId,
        examId: data.examId,
        text: data.text,
        groupId: questionId, // Set groupId to own ID (canonical question)
        isCanonical: true,
      },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
          },
        },
      },
    });
  },

  async update(id: string, data: UpdateQuestionInput, userId: string) {
    // Verify ownership through exam
    const question = await prisma.question.findFirst({
      where: {
        id,
        exam: { createdBy: userId },
      },
    });

    if (!question) {
      throw new Error("Domanda non trovata o non autorizzata");
    }

    return prisma.question.update({
      where: { id },
      data: {
        ...(data.text && { text: data.text }),
      },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
          },
        },
      },
    });
  },

  async delete(id: string, userId: string) {
    // Verify ownership through exam
    const question = await prisma.question.findFirst({
      where: {
        id,
        exam: { createdBy: userId },
      },
    });

    if (!question) {
      throw new Error("Domanda non trovata o non autorizzata");
    }

    return prisma.question.delete({
      where: { id },
    });
  },

  async incrementViews(id: string) {
    return prisma.question.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
    });
  },

  async toggleSave(questionId: string, userId: string) {
    const existing = await prisma.savedQuestion.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (existing) {
      await prisma.savedQuestion.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    }

    await prisma.savedQuestion.create({
      data: {
        questionId,
        userId,
      },
    });
    return { saved: true };
  },

  async getSaved(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [saved, total] = await Promise.all([
      prisma.savedQuestion.findMany({
        where: { userId },
        include: {
          question: {
            include: {
              exam: {
                include: {
                  subject: true,
                  professor: true,
                  university: true,
                },
              },
              _count: {
                select: {
                  studentAnswers: true,
                  comments: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.savedQuestion.count({ where: { userId } }),
    ]);

    return {
      questions: saved.map((s) => ({
        ...s.question,
        isSaved: true,
        savedAt: s.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
