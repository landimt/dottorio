import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { createProfessorSchema } from "@/lib/validations/admin.schema";
import { ZodError } from "zod";

export const GET = withAdminAuth(async () => {
  const professors = await prisma.professor.findMany({
    orderBy: { name: "asc" },
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

  return apiSuccess(professors);
});

export const POST = withAdminAuth(async (request) => {
  const body = await request.json();

  try {
    const data = createProfessorSchema.parse(body);

    // Create professor with subjects relation
    const professor = await prisma.professor.create({
      data: {
        name: data.name.trim(),
        email: data.email?.trim() || null,
        universityId: data.universityId,
        subjects: {
          create: (data.subjectIds || []).map((subjectId: string) => ({
            subjectId,
          })),
        },
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

    return apiSuccess(professor, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});
