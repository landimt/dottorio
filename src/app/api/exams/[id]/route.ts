import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { examService } from "@/lib/services/exam.service";
import { updateExamSchema } from "@/lib/validations/exam.schema";
import { apiSuccess, apiError, apiUnknownError, apiValidationError, ApiErrors } from "@/lib/api/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/exams/[id] - Get a single exam
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const exam = await examService.findById(id);

    if (!exam) {
      return ApiErrors.notFound("Esame");
    }

    return apiSuccess(exam);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero dell'esame");
  }
}

// PUT /api/exams/[id] - Update an exam
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateExamSchema.parse(body);

    const exam = await examService.update(id, validatedData, session.user.id);

    return apiSuccess(exam);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    if (error instanceof Error && error.message === "Esame non trovato o non autorizzato") {
      return apiError(error.message, 404);
    }
    return apiUnknownError(error, "Errore nell'aggiornamento dell'esame");
  }
}

// DELETE /api/exams/[id] - Delete an exam
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    await examService.delete(id, session.user.id);

    return apiSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Esame non trovato o non autorizzato") {
      return apiError(error.message, 404);
    }
    return apiUnknownError(error, "Errore nell'eliminazione dell'esame");
  }
}
