import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiUnknownError } from "@/lib/api/api-response";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return ApiErrors.notFound("Domanda");
    }

    // If this is a canonical question, update variations to remove the link
    if (question.isCanonical) {
      await prisma.question.updateMany({
        where: { canonicalId: id },
        data: {
          canonicalId: null,
          isCanonical: true,
        },
      });
    }

    // Delete the question (cascade will delete related answers, comments, etc)
    await prisma.question.delete({
      where: { id },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiUnknownError(error);
  }
}
