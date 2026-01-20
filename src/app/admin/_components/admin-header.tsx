"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Users, Database, MessageSquare, Flag, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    label: "Utenti",
    icon: Users,
  },
  {
    href: "/admin/cadastros",
    label: "Anagrafiche",
    icon: Database,
  },
  {
    href: "/admin/questions",
    label: "Domande",
    icon: MessageSquare,
  },
  {
    href: "/admin/moderation",
    label: "Moderazione",
    icon: Flag,
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Log",
    icon: ScrollText,
  },
];

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Botão voltar + Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">D</span>
          </div>
        </Link>

        {/* Texto Admin */}
        <div className="mr-6 flex items-center gap-2">
          <span className="text-lg font-semibold">Admin</span>
        </div>

        {/* Navegação */}
        <nav className="flex flex-1 items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
