import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { createUniversitySchema } from "@/lib/validations/admin.schema";
import { ZodError } from "zod";

export const GET = withAdminAuth(async () => {
  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          professors: true,
          users: true,
          courses: true,
        },
      },
    },
  });

  return apiSuccess(universities);
});

export const POST = withAdminAuth(async (request) => {
  const body = await request.json();

  try {
    const data = createUniversitySchema.parse(body);

    const university = await prisma.university.create({
      data: {
        name: data.name.trim(),
        shortName: data.shortName?.trim() || null,
        city: data.city?.trim() || null,
        emoji: data.emoji?.trim() || null,
      },
    });

    return apiSuccess(university, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});
