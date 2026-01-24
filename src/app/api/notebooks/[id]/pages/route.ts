import { auth } from "@/lib/auth";
import { notebookService } from "@/lib/services/notebook.service";
import { createPageSchema } from "@/lib/validations/notebook.schema";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";
import { ZodError } from "zod";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/notebooks/[id]/pages - Create a new page in notebook
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const validatedData = createPageSchema.parse(body);

    const page = await notebookService.createPage(id, validatedData, session.user.id);

    if (!page) {
      return ApiErrors.notFound("Quaderno");
    }

    return apiSuccess(page, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiUnknownError(error);
    }

    return apiUnknownError(error, "Errore nella creazione della pagina");
  }
}
