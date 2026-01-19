import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/questions/[id]/save - Toggle save question
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await questionService.toggleSave(id, session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling save:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio della domanda" },
      { status: 500 }
    );
  }
}
