import { questionService } from "@/lib/services/question.service";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/questions/[id]/view - Increment view count
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await questionService.incrementViews(id);

    return apiSuccess({ viewed: true });
  } catch (error) {
    return apiUnknownError(error, "Errore nell'aggiornamento delle visualizzazioni");
  }
}
