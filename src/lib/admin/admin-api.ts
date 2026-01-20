import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiUnknownError, apiError, ApiErrorResponse } from "@/lib/api/api-response";

export interface AdminApiContext {
  adminId: string;
  adminRole: string;
}

// Route handler types
type RouteHandler<T = unknown> = (
  request: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse>;

type AdminRouteHandler<T = unknown> = (
  request: NextRequest,
  context: { params: Promise<T> },
  admin: AdminApiContext
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps an admin route handler with authentication
 * Usage: export const GET = withAdminAuth(async (req, ctx, admin) => { ... });
 */
export function withAdminAuth<T = unknown>(
  handler: AdminRouteHandler<T>
): RouteHandler<T> {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    try {
      const authResult = await requireAdminApi();
      if (isErrorResponse(authResult)) {
        return authResult;
      }
      return await handler(request, context, authResult);
    } catch (error) {
      return apiUnknownError(error);
    }
  };
}

/**
 * Middleware para APIs de admin
 * Verifica se o usuário é admin antes de permitir a requisição
 */
export async function requireAdminApi(): Promise<AdminApiContext | NextResponse<ApiErrorResponse>> {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError("Non autorizzato", 401, "UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    return apiError("Utente non trovato", 401, "USER_NOT_FOUND");
  }

  if (user.status !== "active") {
    return apiError("Account sospeso", 403, "ACCOUNT_SUSPENDED");
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return apiError("Accesso negato", 403, "FORBIDDEN");
  }

  return {
    adminId: user.id,
    adminRole: user.role,
  };
}

/**
 * Helper para verificar se o resultado é um NextResponse (erro)
 */
export function isErrorResponse(result: AdminApiContext | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
