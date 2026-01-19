import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

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
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: questionId } = await params;
    const body = await request.json();
    const data = answerSchema.parse(body);

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Domanda non trovata" },
        { status: 404 }
      );
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

    return NextResponse.json(answer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
