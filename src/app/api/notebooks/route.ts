import { auth } from "@/lib/auth";
import { notebookService } from "@/lib/services/notebook.service";
import { createNotebookSchema } from "@/lib/validations/notebook.schema";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";
import { ZodError } from "zod";

// GET /api/notebooks - List all notebooks for user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const notebooks = await notebookService.findAll(session.user.id);

    return apiSuccess(notebooks);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero dei quaderni");
  }
}

// POST /api/notebooks - Create a new notebook
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const validatedData = createNotebookSchema.parse(body);

    const notebook = await notebookService.create(validatedData, session.user.id);

    return apiSuccess(notebook, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiUnknownError(error);
    }

    return apiUnknownError(error, "Errore nella creazione del quaderno");
  }
}
