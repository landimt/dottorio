import { auth } from "@/lib/auth";
import { shareLinkService } from "@/lib/services/shareLink.service";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper to check if string is a valid UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/shares/[id] - Get share link by slug (public) or by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // If it's a UUID, it's an ID lookup (authenticated)
    // If it's not a UUID, it's a slug lookup (public)
    if (isUUID(id)) {
      // For UUID, require authentication (optional - could also be public)
      const session = await auth();
      if (!session?.user?.id) {
        return ApiErrors.unauthorized();
      }

      // Find by ID would need a new service method, for now return not found
      return ApiErrors.notFound("Link non trovato");
    }

    // It's a slug - public access
    const shareLink = await shareLinkService.findBySlug(id);

    if (!shareLink) {
      return ApiErrors.notFound("Link non trovato");
    }

    // Increment click count (fire and forget)
    shareLinkService.incrementClickCount(id).catch(() => {});

    return apiSuccess(shareLink);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero del link di condivisione");
  }
}

// DELETE /api/shares/[id] - Delete a share link (by UUID)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;

    await shareLinkService.delete(id, session.user.id);

    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiUnknownError(error, "Errore nell'eliminazione del link di condivisione");
  }
}
