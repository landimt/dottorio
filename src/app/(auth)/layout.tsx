import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
