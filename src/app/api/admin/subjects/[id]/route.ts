import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiError, apiValidationError } from "@/lib/api/api-response";
import { updateSubjectSchema } from "@/lib/validations/admin.schema";
import { ZodError } from "zod";

export const GET = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      professors: {
        include: {
          professor: true,
        },
      },
      _count: {
        select: {
          exams: true,
        },
      },
    },
  });

  if (!subject) {
    return ApiErrors.notFound("Materia");
  }

  return apiSuccess(subject);
});

export const PUT = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();

  try {
    const data = updateSubjectSchema.parse(body);

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.emoji !== undefined && { emoji: data.emoji?.trim() || null }),
        ...(data.color !== undefined && { color: data.color?.trim() || null }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.semester !== undefined && { semester: data.semester }),
        ...(data.credits !== undefined && { credits: data.credits }),
      },
    });

    return apiSuccess(subject);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});

export const DELETE = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  // Check if subject has dependencies
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          exams: true,
        },
      },
    },
  });

  if (!subject) {
    return ApiErrors.notFound("Materia");
  }

  if (subject._count.exams > 0) {
    return apiError(
      "Impossibile eliminare materia con esami collegati",
      400,
      "DEPENDENCY_ERROR"
    );
  }

  // Delete professor-subject relations first
  await prisma.professorSubject.deleteMany({
    where: { subjectId: id },
  });

  await prisma.subject.delete({
    where: { id },
  });

  return apiSuccess({ deleted: true });
});
