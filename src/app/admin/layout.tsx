import { requireAdmin } from "@/lib/admin/admin-auth";
import { AdminHeader } from "./_components/admin-header";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verifica se o usuário é admin (redireciona se não for)
  await requireAdmin();

  // Pega as traduções no servidor
  const t = await getTranslations("admin.nav");

  const translations = {
    dashboard: t("dashboard"),
    users: t("users"),
    registries: t("registries"),
    questions: t("questions"),
    moderation: t("moderation"),
    auditLog: t("auditLog"),
    legal: t("legal"),
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader translations={translations} />
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
