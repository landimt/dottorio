import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";

// POST - Toggle like on an answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id: answerId } = await params;
    const userId = session.user.id;

    // Verify answer exists
    const answer = await prisma.studentAnswer.findUnique({
      where: { id: answerId },
    });

    if (!answer) {
      return ApiErrors.notFound("Risposta");
    }

    // Check if already liked
    const existingLike = await prisma.answerLike.findUnique({
      where: {
        answerId_userId: {
          answerId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.answerLike.delete({
        where: { id: existingLike.id },
      });
      return apiSuccess({ liked: false });
    } else {
      // Like
      await prisma.answerLike.create({
        data: {
          answerId,
          userId,
        },
      });
      return apiSuccess({ liked: true });
    }
  } catch (error) {
    return apiUnknownError(error, "Errore nel toggle del like");
  }
}
