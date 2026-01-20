"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const t = useTranslations("admin.quickActions");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{t("title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {actions.map((action) => {
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center justify-between rounded-lg p-4 transition-colors hover:bg-muted"
            >
              <div className="flex flex-col gap-1">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
