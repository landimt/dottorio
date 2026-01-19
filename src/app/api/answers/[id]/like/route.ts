import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Toggle like on an answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: answerId } = await params;
    const userId = session.user.id;

    // Verify answer exists
    const answer = await prisma.studentAnswer.findUnique({
      where: { id: answerId },
    });

    if (!answer) {
      return NextResponse.json(
        { error: "Risposta non trovata" },
        { status: 404 }
      );
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
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.answerLike.create({
        data: {
          answerId,
          userId,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
