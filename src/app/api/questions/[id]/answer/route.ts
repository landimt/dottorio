import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";
import { apiSuccess, apiUnknownError, apiValidationError, ApiErrors } from "@/lib/api/api-response";

const answerSchema = z.object({
  content: z.string().min(10, "La risposta deve avere almeno 10 caratteri"),
  isPublic: z.boolean().default(false),
});

// POST - Create or update personal answer
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
    const data = answerSchema.parse(body);

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return ApiErrors.notFound("Domanda");
    }

    // Upsert answer
    const answer = await prisma.studentAnswer.upsert({
      where: {
        questionId_userId: {
          questionId,
          userId: session.user.id,
        },
      },
      update: {
        content: data.content,
        isPublic: data.isPublic,
      },
      create: {
        questionId,
        userId: session.user.id,
        content: data.content,
        isPublic: data.isPublic,
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

    return apiSuccess(answer);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    return apiUnknownError(error, "Errore nella creazione della risposta");
  }
}
