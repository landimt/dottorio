import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { shareLinkService } from "@/lib/services/shareLink.service";
import { createShareLinkSchema } from "@/lib/validations/shareLink.schema";
import { apiSuccess, apiUnknownError, apiValidationError, ApiErrors } from "@/lib/api/api-response";

// POST /api/shares - Create a new share link
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const validatedData = createShareLinkSchema.parse(body);

    const shareLink = await shareLinkService.create(validatedData.examId, session.user.id);

    return apiSuccess(shareLink, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    return apiUnknownError(error, "Errore nella creazione del link di condivisione");
  }
}
