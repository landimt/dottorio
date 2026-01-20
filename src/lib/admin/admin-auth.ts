import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type AdminRole = "admin" | "super_admin";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  universityId: string;
  courseId: string | null;
}

/**
 * Verifica se o usuário atual é admin
 * Usado em páginas do módulo admin
 */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      universityId: true,
      courseId: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Verifica se o usuário está ativo
  if (user.status !== "active") {
    redirect("/");
  }

  // Verifica se o usuário é admin
  if (user.role !== "admin" && user.role !== "super_admin") {
    redirect("/");
  }

  return user as AdminUser;
}

/**
 * Verifica se o usuário atual é super admin
 * Usado para funcionalidades críticas
 */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const user = await requireAdmin();

  if (user.role !== "super_admin") {
    redirect("/admin");
  }

  return user;
}

/**
 * Verifica se o usuário é admin (sem redirect)
 * Útil para verificações condicionais
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      status: true,
    },
  });

  if (!user || user.status !== "active") {
    return false;
  }

  return user.role === "admin" || user.role === "super_admin";
}
