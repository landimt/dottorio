import { NextResponse } from "next/server";
import { questionService } from "@/lib/services/question.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/questions/[id]/view - Increment view count
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await questionService.incrementViews(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing views:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento delle visualizzazioni" },
      { status: 500 }
    );
  }
}
