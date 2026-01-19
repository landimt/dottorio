import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";
import { createQuestionSchema } from "@/lib/validations/question.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/exams/[id]/questions - Add a question to an exam
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { id: examId } = await params;
    const body = await request.json();

    const validatedData = createQuestionSchema.parse({
      ...body,
      examId,
    });

    const question = await questionService.create(validatedData, session.user.id);

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);

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
      { error: "Errore nella creazione della domanda" },
      { status: 500 }
    );
  }
}
