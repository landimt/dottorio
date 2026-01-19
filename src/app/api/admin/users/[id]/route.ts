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

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        university: true,
        channel: true,
        _count: {
          select: {
            exams: true,
            studentAnswers: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return ApiErrors.notFound("Utente");
    }

    return apiSuccess(user);
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
    const { name, role, status } = body;

    // Validate role
    const validRoles = ["student", "representative", "admin", "super_admin"];
    if (role && !validRoles.includes(role)) {
      return apiError("Ruolo non valido", 400, "INVALID_ROLE");
    }

    // Validate status
    const validStatuses = ["active", "suspended", "banned"];
    if (status && !validStatuses.includes(status)) {
      return apiError("Stato non valido", 400, "INVALID_STATUS");
    }

    // Prevent changing own role (security measure)
    if (role === "super_admin" && authResult.adminRole !== "super_admin") {
      return apiError(
        "Solo i super admin possono promuovere altri a super admin",
        403,
        "INSUFFICIENT_PRIVILEGES"
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(role && { role }),
        ...(status && { status }),
        // Sync isRepresentative with role
        ...(role && { isRepresentative: role === "representative" }),
      },
    });

    return apiSuccess(user);
  } catch (error) {
    return apiUnknownError(error);
  }
}
