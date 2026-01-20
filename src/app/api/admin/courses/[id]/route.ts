import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiError, apiValidationError } from "@/lib/api/api-response";
import { z } from "zod";
import { ZodError } from "zod";

const updateCourseSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  year: z.number().int().min(1).max(10).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
});

export const GET = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      university: true,
      subjects: {
        orderBy: [{ year: "asc" }, { semester: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              professors: true,
              exams: true,
            },
          },
        },
      },
      _count: {
        select: {
          users: true,
          exams: true,
        },
      },
    },
  });

  if (!course) {
    return ApiErrors.notFound("Corso");
  }

  return apiSuccess(course);
});

export const PUT = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();

  try {
    const data = updateCourseSchema.parse(body);

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.emoji !== undefined && { emoji: data.emoji?.trim() || null }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
      },
    });

    return apiSuccess(course);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});

export const DELETE = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  // Check if course has dependencies
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          users: true,
          exams: true,
        },
      },
    },
  });

  if (!course) {
    return ApiErrors.notFound("Corso");
  }

  if (course._count.subjects > 0) {
    return apiError(
      "Impossibile eliminare corso con materie collegate",
      400,
      "DEPENDENCY_ERROR"
    );
  }

  if (course._count.users > 0) {
    return apiError(
      "Impossibile eliminare corso con utenti collegati",
      400,
      "DEPENDENCY_ERROR"
    );
  }

  if (course._count.exams > 0) {
    return apiError(
      "Impossibile eliminare corso con esami collegati",
      400,
      "DEPENDENCY_ERROR"
    );
  }

  await prisma.course.delete({
    where: { id },
  });

  return apiSuccess({ deleted: true });
});
