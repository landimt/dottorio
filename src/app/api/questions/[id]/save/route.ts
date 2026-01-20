import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/questions/[id]/save - Toggle save question
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    const result = await questionService.toggleSave(id, session.user.id);

    return apiSuccess(result);
  } catch (error) {
    return apiUnknownError(error, "Errore nel salvataggio della domanda");
  }
}
