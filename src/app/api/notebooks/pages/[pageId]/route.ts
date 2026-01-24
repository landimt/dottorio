import { auth } from "@/lib/auth";
import { notebookService } from "@/lib/services/notebook.service";
import { updatePageSchema } from "@/lib/validations/notebook.schema";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";
import { ZodError } from "zod";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

// GET /api/notebooks/pages/[pageId] - Get a specific page
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const page = await notebookService.findPageById(pageId, session.user.id);

    if (!page) {
      return ApiErrors.notFound("Pagina");
    }

    return apiSuccess(page);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero della pagina");
  }
}

// PATCH /api/notebooks/pages/[pageId] - Update a page
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const validatedData = updatePageSchema.parse(body);

    const page = await notebookService.updatePage(pageId, validatedData, session.user.id);

    if (!page) {
      return ApiErrors.notFound("Pagina");
    }

    return apiSuccess(page);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiUnknownError(error);
    }

    return apiUnknownError(error, "Errore nell'aggiornamento della pagina");
  }
}

// DELETE /api/notebooks/pages/[pageId] - Delete a page
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const page = await notebookService.deletePage(pageId, session.user.id);

    if (!page) {
      return ApiErrors.notFound("Pagina");
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cannot delete")) {
      return ApiErrors.badRequest("Non puoi eliminare l'ultima pagina del quaderno");
    }

    return apiUnknownError(error, "Errore nell'eliminazione della pagina");
  }
}
