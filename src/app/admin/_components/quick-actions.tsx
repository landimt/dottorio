"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Users, School, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IconName = "users" | "school" | "book-open" | "graduation-cap";

const iconMap = {
  "users": Users,
  "school": School,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
} as const;

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: IconName;
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
          const Icon = iconMap[action.icon];
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center justify-between rounded-lg p-4 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
