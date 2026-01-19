import { requireAdmin } from "@/lib/admin/admin-auth";
import { AdminHeader } from "./_components/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verifica se o usuário é admin (redireciona se não for)
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}
