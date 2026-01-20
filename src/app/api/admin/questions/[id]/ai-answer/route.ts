import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const aiAnswerSchema = z.object({
  content: z.string().min(1, "Il contenuto è richiesto"),
  source: z.string().optional(),
  model: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Solo gli admin possono creare risposte IA",
          },
        },
        { status: 403 }
      );
    }

    const { id: questionId } = await context.params;
    const body = await req.json();

    // Validate request body
    const validatedData = aiAnswerSchema.parse(body);

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Domanda non trovata",
          },
        },
        { status: 404 }
      );
    }

    // Upsert AI answer (create or update)
    const aiAnswer = await prisma.aiAnswer.upsert({
      where: {
        questionId,
      },
      update: {
        content: validatedData.content,
        source: validatedData.source,
        model: validatedData.model,
      },
      create: {
        questionId,
        content: validatedData.content,
        source: validatedData.source,
        model: validatedData.model,
      },
    });

    return NextResponse.json({
      success: true,
      data: aiAnswer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Dati non validi",
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Error saving AI answer:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Errore nel salvataggio della risposta IA",
        },
      },
      { status: 500 }
    );
  }
}
