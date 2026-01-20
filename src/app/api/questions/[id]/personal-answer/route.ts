import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/questions/[id]/personal-answer
 * Get user's personal answer for this question
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;

    const personalAnswer = await prisma.studentAnswer.findUnique({
      where: {
        questionId_userId: {
          questionId: id,
          userId: session.user.id,
        },
      },
    });

    return apiSuccess(personalAnswer);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero della risposta personale");
  }
}
