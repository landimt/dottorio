import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";
import { updateQuestionSchema } from "@/lib/validations/question.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/questions/[id] - Get a single question
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    const question = await questionService.findById(id, session?.user?.id);

    if (!question) {
      return NextResponse.json(
        { error: "Domanda non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Errore nel recupero della domanda" },
      { status: 500 }
    );
  }
}

// PUT /api/questions/[id] - Update a question
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateQuestionSchema.parse(body);

    const question = await questionService.update(id, validatedData, session.user.id);

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);

    if (error instanceof Error) {
      if (error.message === "Domanda non trovata o non autorizzata") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Dati non validi", details: error },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Errore nell'aggiornamento della domanda" },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - Delete a question
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await questionService.delete(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);

    if (error instanceof Error && error.message === "Domanda non trovata o non autorizzata") {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Errore nell'eliminazione della domanda" },
      { status: 500 }
    );
  }
}
