import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiError, apiUnknownError } from "@/lib/api/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

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
  } catch (error) {
    return apiUnknownError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

    const { id } = await params;
    const body = await request.json();
    const { name, universityId, subjectIds } = body;

    if (!name?.trim()) {
      return ApiErrors.badRequest("Nome è obbligatorio");
    }

    // Update professor and rebuild subjects relation
    const professor = await prisma.$transaction(async (tx) => {
      // Delete existing subject relations
      await tx.professorSubject.deleteMany({
        where: { professorId: id },
      });

      // Update professor with new subjects
      return tx.professor.update({
        where: { id },
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
    });

    return apiSuccess(professor);
  } catch (error) {
    return apiUnknownError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

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
  } catch (error) {
    return apiUnknownError(error);
  }
}
