import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";
import { apiSuccess, apiUnknownError, apiValidationError, ApiErrors } from "@/lib/api/api-response";

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
});

// POST - Rate an AI answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id: aiAnswerId } = await params;
    const body = await request.json();
    const data = ratingSchema.parse(body);

    // Verify AI answer exists
    const aiAnswer = await prisma.aiAnswer.findUnique({
      where: { id: aiAnswerId },
    });

    if (!aiAnswer) {
      return ApiErrors.notFound("Risposta IA");
    }

    // Upsert rating
    const rating = await prisma.aiRating.upsert({
      where: {
        aiAnswerId_userId: {
          aiAnswerId,
          userId: session.user.id,
        },
      },
      update: {
        rating: data.rating,
        feedback: data.feedback,
      },
      create: {
        aiAnswerId,
        userId: session.user.id,
        rating: data.rating,
        feedback: data.feedback,
      },
    });

    return apiSuccess(rating);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    return apiUnknownError(error, "Errore nella valutazione della risposta IA");
  }
}
