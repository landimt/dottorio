import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";
import { updateQuestionSchema } from "@/lib/validations/question.schema";
import { apiSuccess, apiError, apiUnknownError, apiValidationError, ApiErrors } from "@/lib/api/api-response";

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
      return ApiErrors.notFound("Domanda");
    }

    return apiSuccess(question);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero della domanda");
  }
}

// PUT /api/questions/[id] - Update a question
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateQuestionSchema.parse(body);

    const question = await questionService.update(id, validatedData, session.user.id);

    return apiSuccess(question);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    if (error instanceof Error && error.message === "Domanda non trovata o non autorizzata") {
      return apiError(error.message, 404);
    }
    return apiUnknownError(error, "Errore nell'aggiornamento della domanda");
  }
}

// DELETE /api/questions/[id] - Delete a question
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    await questionService.delete(id, session.user.id);

    return apiSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Domanda non trovata o non autorizzata") {
      return apiError(error.message, 404);
    }
    return apiUnknownError(error, "Errore nell'eliminazione della domanda");
  }
}
