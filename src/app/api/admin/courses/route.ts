import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, apiValidationError, apiError } from "@/lib/api/api-response";
import { z } from "zod";
import { ZodError } from "zod";

const createCourseSchema = z.object({
  name: z.string().min(2).max(100),
  universityId: z.string().uuid(),
  year: z.number().int().min(1).max(10).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
});

export const GET = withAdminAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const universityId = searchParams.get("universityId");

  const courses = await prisma.course.findMany({
    where: universityId ? { universityId } : undefined,
    orderBy: { name: "asc" },
    include: {
      university: true,
      _count: {
        select: {
          subjects: true,
          users: true,
          exams: true,
        },
      },
    },
  });

  return apiSuccess(courses);
});

export const POST = withAdminAuth(async (request) => {
  const body = await request.json();

  try {
    const data = createCourseSchema.parse(body);

    // Check for duplicates
    const existing = await prisma.course.findUnique({
      where: {
        universityId_name: {
          universityId: data.universityId,
          name: data.name.trim(),
        },
      },
    });

    if (existing) {
      return apiError("Corso già esistente per questa università", 400, "DUPLICATE_ERROR");
    }

    const course = await prisma.course.create({
      data: {
        name: data.name.trim(),
        universityId: data.universityId,
        year: data.year || null,
        emoji: data.emoji?.trim() || null,
        description: data.description?.trim() || null,
      },
      include: {
        university: true,
      },
    });

    return apiSuccess(course, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});
