import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";
import { searchQuestionsSchema, createQuestionSchema } from "@/lib/validations/question.schema";

// GET /api/questions - Search questions
export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const params = {
      query: searchParams.get("query") || undefined,
      subjectId: searchParams.get("subjectId") || undefined,
      professorId: searchParams.get("professorId") || undefined,
      universityId: searchParams.get("universityId") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    };

    const validatedParams = searchQuestionsSchema.parse(params);
    const result = await questionService.search(validatedParams, session?.user?.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching questions:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Parametri non validi", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Errore nella ricerca delle domande" },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new question
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createQuestionSchema.parse(body);

    const question = await questionService.create(validatedData, session.user.id);

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dati non validi", details: error },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("non trovato")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Errore nella creazione della domanda" },
      { status: 500 }
    );
  }
}
