import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id: questionId } = await params;
    const body = await request.json();
    const { canonicalId } = body;

    if (!canonicalId) {
      return ApiErrors.badRequest("ID della domanda canonica richiesto");
    }

    // Get the question to link
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return ApiErrors.notFound("Domanda");
    }

    // Get the canonical question
    const canonical = await prisma.question.findUnique({
      where: { id: canonicalId },
      include: {
        _count: {
          select: {
            variations: true,
            studentAnswers: { where: { isPublic: true } },
          },
        },
        aiAnswer: { select: { id: true } },
      },
    });

    if (!canonical) {
      return ApiErrors.notFound("Domanda canonica");
    }

    // Update the question to link it to the canonical
    await prisma.question.update({
      where: { id: questionId },
      data: {
        groupId: canonical.groupId,
        isCanonical: false,
        canonicalId: canonicalId,
      },
    });

    // Count total questions in the group now
    const groupCount = await prisma.question.count({
      where: { groupId: canonical.groupId },
    });

    return apiSuccess({
      message: "Domanda collegata con successo",
      group: {
        totalQuestions: groupCount,
        hasAiAnswer: !!canonical.aiAnswer,
        studentAnswersCount: canonical._count.studentAnswers,
        canonicalText: canonical.text,
      },
    });
  } catch (error) {
    return apiUnknownError(error, "Errore nel collegamento della domanda");
  }
}
