import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pb-20 md:pb-0">{children}</main>
      </div>
    </SessionProvider>
  );
}
