import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

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
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: aiAnswerId } = await params;
    const body = await request.json();
    const data = ratingSchema.parse(body);

    // Verify AI answer exists
    const aiAnswer = await prisma.aiAnswer.findUnique({
      where: { id: aiAnswerId },
    });

    if (!aiAnswer) {
      return NextResponse.json(
        { error: "Risposta IA non trovata" },
        { status: 404 }
      );
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

    return NextResponse.json(rating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error rating AI answer:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
