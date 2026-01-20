import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { createSubjectSchema } from "@/lib/validations/admin.schema";
import { ZodError } from "zod";

export const GET = withAdminAuth(async () => {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      course: {
        include: {
          university: true,
        },
      },
      _count: {
        select: {
          professors: true,
          exams: true,
        },
      },
    },
  });

  return apiSuccess(subjects);
});

export const POST = withAdminAuth(async (request) => {
  const body = await request.json();

  try {
    const data = createSubjectSchema.parse(body);

    const subject = await prisma.subject.create({
      data: {
        name: data.name.trim(),
        courseId: data.courseId,
        emoji: data.emoji?.trim() || null,
        color: data.color?.trim() || null,
        semester: data.semester || null,
        year: data.year || null,
        credits: data.credits || null,
      },
      include: {
        course: {
          include: {
            university: true,
          },
        },
      },
    });

    return apiSuccess(subject, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});
