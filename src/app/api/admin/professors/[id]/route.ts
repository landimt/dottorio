import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiError, apiValidationError } from "@/lib/api/api-response";
import { updateProfessorSchema } from "@/lib/validations/admin.schema";
import { ZodError } from "zod";

export const GET = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  const professor = await prisma.professor.findUnique({
    where: { id },
    include: {
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
    },
  });

  if (!professor) {
    return ApiErrors.notFound("Professore");
  }

  return apiSuccess(professor);
});

export const PUT = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();

  try {
    const data = updateProfessorSchema.parse(body);

    // Update professor and rebuild subjects relation
    const professor = await prisma.$transaction(async (tx) => {
      // Delete existing subject relations if subjectIds provided
      if (data.subjectIds !== undefined) {
        await tx.professorSubject.deleteMany({
          where: { professorId: id },
        });
      }

      // Update professor with new data
      return tx.professor.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name.trim() }),
          ...(data.email !== undefined && { email: data.email?.trim() || null }),
          ...(data.universityId && { universityId: data.universityId }),
          ...(data.subjectIds !== undefined && {
            subjects: {
              create: data.subjectIds.map((subjectId: string) => ({
                subjectId,
              })),
            },
          }),
        },
        include: {
          university: true,
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      });
    });

    return apiSuccess(professor);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});

export const DELETE = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  // Check if professor has dependencies
  const professor = await prisma.professor.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          exams: true,
        },
      },
    },
  });

  if (!professor) {
    return ApiErrors.notFound("Professore");
  }

  if (professor._count.exams > 0) {
    return apiError(
      "Impossibile eliminare professore con esami collegati",
      400,
      "DEPENDENCY_ERROR"
    );
  }

  // Delete professor-subject relations first
  await prisma.professorSubject.deleteMany({
    where: { professorId: id },
  });

  await prisma.professor.delete({
    where: { id },
  });

  return apiSuccess({ deleted: true });
});
