import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiError, apiValidationError } from "@/lib/api/api-response";
import { updateUniversitySchema } from "@/lib/validations/admin.schema";
import { ZodError } from "zod";

export const GET = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  const university = await prisma.university.findUnique({
    where: { id },
    include: {
      courses: true,
      _count: {
        select: {
          professors: true,
          users: true,
        },
      },
    },
  });

  if (!university) {
    return ApiErrors.notFound("Università");
  }

  return apiSuccess(university);
});

export const PUT = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();

  try {
    const data = updateUniversitySchema.parse(body);

    const university = await prisma.university.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.shortName !== undefined && { shortName: data.shortName?.trim() || null }),
        ...(data.city !== undefined && { city: data.city?.trim() || null }),
        ...(data.emoji !== undefined && { emoji: data.emoji?.trim() || null }),
      },
    });

    return apiSuccess(university);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});

export const DELETE = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  // Check if university has dependencies
  const university = await prisma.university.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          professors: true,
          exams: true,
        },
      },
    },
  });

  if (!university) {
    return ApiErrors.notFound("Università");
  }

  if (university._count.users > 0 || university._count.exams > 0) {
    return apiError(
      "Impossibile eliminare università con utenti o esami collegati",
      400,
      "DEPENDENCY_ERROR"
    );
  }

  await prisma.university.delete({
    where: { id },
  });

  return apiSuccess({ deleted: true });
});
