import { auth } from "@/lib/auth";
import { notebookService } from "@/lib/services/notebook.service";
import { updateNotebookSchema } from "@/lib/validations/notebook.schema";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";
import { ZodError } from "zod";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/notebooks/[id] - Get a specific notebook
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const notebook = await notebookService.findById(id, session.user.id);

    if (!notebook) {
      return ApiErrors.notFound("Quaderno");
    }

    return apiSuccess(notebook);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero del quaderno");
  }
}

// PATCH /api/notebooks/[id] - Update a notebook
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const validatedData = updateNotebookSchema.parse(body);

    const notebook = await notebookService.update(id, validatedData, session.user.id);

    if (!notebook) {
      return ApiErrors.notFound("Quaderno");
    }

    return apiSuccess(notebook);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiUnknownError(error);
    }

    return apiUnknownError(error, "Errore nell'aggiornamento del quaderno");
  }
}

// DELETE /api/notebooks/[id] - Delete a notebook
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const notebook = await notebookService.delete(id, session.user.id);

    if (!notebook) {
      return ApiErrors.notFound("Quaderno");
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiUnknownError(error, "Errore nell'eliminazione del quaderno");
  }
}
