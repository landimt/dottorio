import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { examService } from "@/lib/services/exam.service";
import { createExamSchema } from "@/lib/validations/exam.schema";
import { apiSuccess, apiUnknownError, apiValidationError, ApiErrors } from "@/lib/api/api-response";

// GET /api/exams - List all exams (optionally filtered by user)
export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const myExams = searchParams.get("my") === "true";

    const exams = await examService.findAll(
      myExams && session?.user?.id ? session.user.id : undefined
    );

    return apiSuccess(exams);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero degli esami");
  }
}

// POST /api/exams - Create a new exam
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const validatedData = createExamSchema.parse(body);

    const exam = await examService.create(validatedData, session.user.id);

    return apiSuccess(exam, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    return apiUnknownError(error, "Errore nella creazione dell'esame");
  }
}
