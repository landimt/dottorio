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

    const university = await prisma.university.findUnique({
      where: { id },
      include: {
        channels: true,
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
    const { name, shortName, city, emoji } = body;

    if (!name?.trim()) {
      return ApiErrors.badRequest("Nome è obbligatorio");
    }

    const university = await prisma.university.update({
      where: { id },
      data: {
        name: name.trim(),
        shortName: shortName?.trim() || null,
        city: city?.trim() || null,
        emoji: emoji?.trim() || null,
      },
    });

    return apiSuccess(university);
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
  } catch (error) {
    return apiUnknownError(error);
  }
}
