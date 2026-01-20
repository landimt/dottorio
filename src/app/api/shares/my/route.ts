import { auth } from "@/lib/auth";
import { shareLinkService } from "@/lib/services/shareLink.service";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";

// GET /api/shares/my - Get user's share links
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const shareLinks = await shareLinkService.findByUser(session.user.id);

    return apiSuccess(shareLinks);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero dei link di condivisione");
  }
}
