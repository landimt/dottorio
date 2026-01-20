import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiError, apiValidationError } from "@/lib/api/api-response";
import { updateUserSchema } from "@/lib/validations/admin.schema";
import { ZodError } from "zod";

export const GET = withAdminAuth<{ id: string }>(async (request, { params }) => {
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
});

export const PUT = withAdminAuth<{ id: string }>(async (request, { params }, authResult) => {
  const { id } = await params;
  const body = await request.json();

  try {
    const data = updateUserSchema.parse(body);

    // Prevent changing own role (security measure)
    if (data.role === "super_admin" && authResult.adminRole !== "super_admin") {
      return apiError(
        "Solo i super admin possono promuovere altri a super admin",
        403,
        "INSUFFICIENT_PRIVILEGES"
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.role && { role: data.role }),
        ...(data.status && { status: data.status }),
        // Sync isRepresentative with role
        ...(data.role && { isRepresentative: data.role === "representative" }),
      },
    });

    return apiSuccess(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});
