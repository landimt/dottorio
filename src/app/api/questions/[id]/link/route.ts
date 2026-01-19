import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { id: questionId } = await params;
    const body = await request.json();
    const { canonicalId } = body;

    if (!canonicalId) {
      return NextResponse.json(
        { error: "ID della domanda canonica richiesto" },
        { status: 400 }
      );
    }

    // Get the question to link
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Domanda non trovata" },
        { status: 404 }
      );
    }

    // Get the canonical question
    const canonical = await prisma.question.findUnique({
      where: { id: canonicalId },
      include: {
        _count: {
          select: {
            variations: true,
            studentAnswers: { where: { isPublic: true } },
          },
        },
        aiAnswer: { select: { id: true } },
      },
    });

    if (!canonical) {
      return NextResponse.json(
        { error: "Domanda canonica non trovata" },
        { status: 404 }
      );
    }

    // Update the question to link it to the canonical
    await prisma.question.update({
      where: { id: questionId },
      data: {
        groupId: canonical.groupId,
        isCanonical: false,
        canonicalId: canonicalId,
      },
    });

    // Count total questions in the group now
    const groupCount = await prisma.question.count({
      where: { groupId: canonical.groupId },
    });

    return NextResponse.json({
      success: true,
      message: "Domanda collegata con successo",
      group: {
        totalQuestions: groupCount,
        hasAiAnswer: !!canonical.aiAnswer,
        studentAnswersCount: canonical._count.studentAnswers,
        canonicalText: canonical.text,
      },
    });
  } catch (error) {
    console.error("Error linking question:", error);
    return NextResponse.json(
      { error: "Errore nel collegamento della domanda" },
      { status: 500 }
    );
  }
}
