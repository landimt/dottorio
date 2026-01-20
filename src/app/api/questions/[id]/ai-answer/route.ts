import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const aiAnswer = await prisma.aiAnswer.findUnique({
      where: {
        questionId: id,
      },
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!aiAnswer) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Risposta IA non trovata",
          },
        },
        { status: 404 }
      );
    }

    // Calculate average rating
    const averageRating =
      aiAnswer.ratings.length > 0
        ? aiAnswer.ratings.reduce((sum, r) => sum + r.rating, 0) /
          aiAnswer.ratings.length
        : null;

    return NextResponse.json({
      success: true,
      data: {
        ...aiAnswer,
        averageRating,
        ratingsCount: aiAnswer.ratings.length,
      },
    });
  } catch (error) {
    console.error("Error fetching AI answer:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Errore nel recupero della risposta IA",
        },
      },
      { status: 500 }
    );
  }
}
