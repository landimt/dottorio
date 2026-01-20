import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/questions/[id]/variations
 * Get question variations (same groupId)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // First get the question to find its groupId
    const question = await prisma.question.findUnique({
      where: { id },
      select: { groupId: true },
    });

    if (!question?.groupId) {
      return apiSuccess([]);
    }

    // Get variations (same groupId, different id)
    const variations = await prisma.question.findMany({
      where: {
        groupId: question.groupId,
        id: { not: id },
      },
      include: {
        exam: {
          include: {
            professor: true,
            university: true,
            subject: true,
          },
        },
        _count: {
          select: {
            studentAnswers: { where: { isPublic: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return apiSuccess(variations);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero delle variazioni della domanda");
  }
}
