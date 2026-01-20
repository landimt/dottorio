import { prisma } from "@/lib/prisma";
import type { CreateExamInput, UpdateExamInput } from "@/lib/validations/exam.schema";

export const examService = {
  async findAll(userId?: string) {
    return prisma.exam.findMany({
      where: userId ? { createdBy: userId } : undefined,
      include: {
        subject: true,
        professor: true,
        university: true,
        course: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        professor: true,
        university: true,
        course: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          include: {
            _count: {
              select: {
                studentAnswers: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  async create(data: CreateExamInput, userId: string) {
    return prisma.exam.create({
      data: {
        subjectId: data.subjectId,
        professorId: data.professorId,
        universityId: data.universityId,
        courseId: data.courseId || null,
        year: data.year || null,
        examDate: data.date ? new Date(data.date) : null,
        description: data.notes,
        createdBy: userId,
      },
      include: {
        subject: true,
        professor: true,
        university: true,
        course: true,
      },
    });
  },

  async update(id: string, data: UpdateExamInput, userId: string) {
    // Verify ownership
    const exam = await prisma.exam.findFirst({
      where: { id, createdBy: userId },
    });

    if (!exam) {
      throw new Error("Esame non trovato o non autorizzato");
    }

    return prisma.exam.update({
      where: { id },
      data: {
        ...(data.subjectId && { subjectId: data.subjectId }),
        ...(data.professorId && { professorId: data.professorId }),
        ...(data.universityId && { universityId: data.universityId }),
        ...(data.courseId !== undefined && { courseId: data.courseId || null }),
        ...(data.year !== undefined && { year: data.year || null }),
        ...(data.date && { examDate: new Date(data.date) }),
        ...(data.notes !== undefined && { description: data.notes }),
      },
      include: {
        subject: true,
        professor: true,
        university: true,
        course: true,
      },
    });
  },

  async delete(id: string, userId: string) {
    // Verify ownership
    const exam = await prisma.exam.findFirst({
      where: { id, createdBy: userId },
    });

    if (!exam) {
      throw new Error("Esame non trovato o non autorizzato");
    }

    return prisma.exam.delete({
      where: { id },
    });
  },

  async findByUser(userId: string) {
    return prisma.exam.findMany({
      where: { createdBy: userId },
      include: {
        subject: true,
        professor: true,
        university: true,
        course: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
