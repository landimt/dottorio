import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors } from "@/lib/api/api-response";

export const DELETE = withAdminAuth<{ id: string; professorSubjectId: string }>(
  async (request, { params }) => {
    const { professorSubjectId } = await params;

    // Check if the association exists
    const association = await prisma.professorSubject.findUnique({
      where: { id: professorSubjectId },
    });

    if (!association) {
      return ApiErrors.notFound("Associazione professore-materia");
    }

    await prisma.professorSubject.delete({
      where: { id: professorSubjectId },
    });

    return apiSuccess({ deleted: true });
  }
);
