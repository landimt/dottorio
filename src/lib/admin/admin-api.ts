import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export interface AdminApiContext {
  adminId: string;
  adminRole: string;
}

/**
 * Middleware para APIs de admin
 * Verifica se o usuário é admin antes de permitir a requisição
 */
export async function requireAdminApi(): Promise<AdminApiContext | NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 401 }
    );
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
    return NextResponse.json(
      { error: "Utente non trovato" },
      { status: 401 }
    );
  }

  if (user.status !== "active") {
    return NextResponse.json(
      { error: "Account sospeso" },
      { status: 403 }
    );
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return NextResponse.json(
      { error: "Accesso negato" },
      { status: 403 }
    );
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
