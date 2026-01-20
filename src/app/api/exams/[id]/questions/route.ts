import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";
import { createQuestionSchema } from "@/lib/validations/question.schema";
import { apiSuccess, apiError, apiUnknownError, apiValidationError, ApiErrors } from "@/lib/api/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/exams/[id]/questions - Add a question to an exam
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id: examId } = await params;
    const body = await request.json();

    const validatedData = createQuestionSchema.parse({
      ...body,
      examId,
    });

    const question = await questionService.create(validatedData, session.user.id);

    return apiSuccess(question, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    if (error instanceof Error && error.message === "Esame non trovato o non autorizzato") {
      return apiError(error.message, 404);
    }
    return apiUnknownError(error, "Errore nella creazione della domanda");
  }
}
