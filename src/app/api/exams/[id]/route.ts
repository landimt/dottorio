import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { examService } from "@/lib/services/exam.service";
import { updateExamSchema } from "@/lib/validations/exam.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/exams/[id] - Get a single exam
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const exam = await examService.findById(id);

    if (!exam) {
      return NextResponse.json(
        { error: "Esame non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dell'esame" },
      { status: 500 }
    );
  }
}

// PUT /api/exams/[id] - Update an exam
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
    const validatedData = updateExamSchema.parse(body);

    const exam = await examService.update(id, validatedData, session.user.id);

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error updating exam:", error);

    if (error instanceof Error) {
      if (error.message === "Esame non trovato o non autorizzato") {
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
      { error: "Errore nell'aggiornamento dell'esame" },
      { status: 500 }
    );
  }
}

// DELETE /api/exams/[id] - Delete an exam
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
    await examService.delete(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exam:", error);

    if (error instanceof Error && error.message === "Esame non trovato o non autorizzato") {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Errore nell'eliminazione dell'esame" },
      { status: 500 }
    );
  }
}
