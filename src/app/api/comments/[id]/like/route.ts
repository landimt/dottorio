import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";

// POST - Toggle like on a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id: commentId } = await params;
    const userId = session.user.id;

    // Verify comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return ApiErrors.notFound("Commento");
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      return apiSuccess({ liked: false });
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
      return apiSuccess({ liked: true });
    }
  } catch (error) {
    return apiUnknownError(error, "Errore nel toggle del like");
  }
}
