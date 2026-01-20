import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiValidationError } from "@/lib/api/api-response";
import { z } from "zod";
import { ZodError } from "zod";

const associateProfessorsSchema = z.object({
  professorIds: z.array(z.string().uuid()).min(1),
});

export const GET = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      professors: {
        include: {
          professor: {
            include: {
              _count: {
                select: {
                  exams: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!subject) {
    return ApiErrors.notFound("Materia");
  }

  const professors = subject.professors.map((ps) => ({
    ...ps.professor,
    professorSubjectId: ps.id,
  }));

  return apiSuccess(professors);
});

export const POST = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id: subjectId } = await params;
  const body = await request.json();

  try {
    const data = associateProfessorsSchema.parse(body);

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return ApiErrors.notFound("Materia");
    }

    // Create associations for each professor
    const associations = await prisma.$transaction(
      data.professorIds.map((professorId) =>
        prisma.professorSubject.upsert({
          where: {
            professorId_subjectId: {
              professorId,
              subjectId,
            },
          },
          create: {
            professorId,
            subjectId,
          },
          update: {},
          include: {
            professor: {
              include: {
                _count: {
                  select: {
                    exams: true,
                  },
                },
              },
            },
          },
        })
      )
    );

    const professors = associations.map((ps) => ({
      ...ps.professor,
      professorSubjectId: ps.id,
    }));

    return apiSuccess({ professors }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});
