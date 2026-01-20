import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const unauthorized = NextResponse.json(
  { error: "Unauthorized" },
  { status: 401 }
);

// PATCH /api/admin/questions/[id] - Update question text
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "admin") {
      return unauthorized;
    }

    const { id } = await context.params;
    const { text } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: { message: "Il testo della domanda è richiesto" } },
        { status: 400 }
      );
    }

    const question = await prisma.question.update({
      where: { id },
      data: { text: text.trim() },
    });

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: { message: "Errore durante l'aggiornamento della domanda" } },
      { status: 500 }
    );
  }
}
