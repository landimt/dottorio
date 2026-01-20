import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const rateAiAnswerSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Devi effettuare il login per valutare una risposta",
          },
        },
        { status: 401 }
      );
    }

    const { id: aiAnswerId } = await context.params;
    const body = await req.json();

    const validatedData = rateAiAnswerSchema.parse(body);

    const aiAnswer = await prisma.aiAnswer.findUnique({
      where: { id: aiAnswerId },
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

    const aiRating = await prisma.aiRating.upsert({
      where: {
        aiAnswerId_userId: {
          aiAnswerId,
          userId: session.user.id,
        },
      },
      update: {
        rating: validatedData.rating,
        feedback: validatedData.feedback,
      },
      create: {
        aiAnswerId,
        userId: session.user.id,
        rating: validatedData.rating,
        feedback: validatedData.feedback,
      },
    });

    return NextResponse.json({
      success: true,
      data: aiRating,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Dati non validi",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Error rating AI answer:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Errore nella valutazione della risposta",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Devi effettuare il login",
          },
        },
        { status: 401 }
      );
    }

    const { id: aiAnswerId } = await context.params;

    const rating = await prisma.aiRating.findUnique({
      where: {
        aiAnswerId_userId: {
          aiAnswerId,
          userId: session.user.id,
        },
      },
    });

    if (!rating) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: rating,
    });
  } catch (error) {
    console.error("Error fetching AI answer rating:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Errore nel recupero della valutazione",
        },
      },
      { status: 500 }
    );
  }
}
