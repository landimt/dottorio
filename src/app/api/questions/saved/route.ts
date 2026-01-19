import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";

// GET /api/questions/saved - Get saved questions
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await questionService.getSaved(session.user.id, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching saved questions:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle domande salvate" },
      { status: 500 }
    );
  }
}
