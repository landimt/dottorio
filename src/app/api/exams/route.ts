import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { examService } from "@/lib/services/exam.service";
import { createExamSchema } from "@/lib/validations/exam.schema";

// GET /api/exams - List all exams (optionally filtered by user)
export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const myExams = searchParams.get("my") === "true";

    const exams = await examService.findAll(
      myExams && session?.user?.id ? session.user.id : undefined
    );

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Errore nel recupero degli esami" },
      { status: 500 }
    );
  }
}

// POST /api/exams - Create a new exam
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createExamSchema.parse(body);

    const exam = await examService.create(validatedData, session.user.id);

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Error creating exam:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dati non validi", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Errore nella creazione dell'esame" },
      { status: 500 }
    );
  }
}
