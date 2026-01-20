import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";
import { apiSuccess, apiUnknownError, apiValidationError, ApiErrors } from "@/lib/api/api-response";

const commentSchema = z.object({
  content: z.string().min(5, "Il commento deve avere almeno 5 caratteri"),
});

// GET - Get comments for a question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { id: questionId } = await params;

    const comments = await prisma.comment.findMany({
      where: { questionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            university: { select: { name: true } },
            year: true,
          },
        },
        _count: {
          select: { likes: true },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(
      comments.map((c) => ({
        ...c,
        isLiked: userId ? c.likes && c.likes.length > 0 : false,
        likesCount: c._count.likes,
        likes: undefined,
        _count: undefined,
      }))
    );
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero dei commenti");
  }
}

// POST - Create a comment
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
    const data = commentSchema.parse(body);

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return ApiErrors.notFound("Domanda");
    }

    const comment = await prisma.comment.create({
      data: {
        questionId,
        userId: session.user.id,
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            university: { select: { name: true } },
            year: true,
          },
        },
      },
    });

    return apiSuccess(comment, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    return apiUnknownError(error, "Errore nella creazione del commento");
  }
}
