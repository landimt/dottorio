import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";

// GET /api/questions/saved - Get saved questions
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await questionService.getSaved(session.user.id, page, limit);

    return apiSuccess(result);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero delle domande salvate");
  }
}
