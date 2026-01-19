import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Toggle like on a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: commentId } = await params;
    const userId = session.user.id;

    // Verify comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Commento non trovato" },
        { status: 404 }
      );
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
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          commentId,
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
