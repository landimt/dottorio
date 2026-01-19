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

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        professors: {
          include: {
            professor: true,
          },
        },
        _count: {
          select: {
            exams: true,
          },
        },
      },
    });

    if (!subject) {
      return ApiErrors.notFound("Materia");
    }

    return apiSuccess(subject);
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
    const { name, emoji, color } = body;

    if (!name?.trim()) {
      return ApiErrors.badRequest("Nome è obbligatorio");
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name: name.trim(),
        emoji: emoji?.trim() || null,
        color: color?.trim() || null,
      },
    });

    return apiSuccess(subject);
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

    // Check if subject has dependencies
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            exams: true,
          },
        },
      },
    });

    if (!subject) {
      return ApiErrors.notFound("Materia");
    }

    if (subject._count.exams > 0) {
      return apiError(
        "Impossibile eliminare materia con esami collegati",
        400,
        "DEPENDENCY_ERROR"
      );
    }

    // Delete professor-subject relations first
    await prisma.professorSubject.deleteMany({
      where: { subjectId: id },
    });

    await prisma.subject.delete({
      where: { id },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiUnknownError(error);
  }
}
