import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiUnknownError } from "@/lib/api/api-response";

export async function GET() {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

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
  } catch (error) {
    return apiUnknownError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

    const body = await request.json();
    const { name, universityId, subjectIds } = body;

    if (!name?.trim()) {
      return ApiErrors.badRequest("Nome è obbligatorio");
    }

    // Create professor with subjects relation
    const professor = await prisma.professor.create({
      data: {
        name: name.trim(),
        universityId: universityId || null,
        subjects: {
          create: (subjectIds || []).map((subjectId: string) => ({
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
    return apiUnknownError(error);
  }
}
