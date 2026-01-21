"use client";

import { ArrowLeft, CheckCircle2, Circle, Clock, Cookie } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ChecklistItem {
  id: string;
  status: "done" | "in_progress" | "pending";
  link?: string;
}

const statusConfig = {
  done: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900",
    labelKey: "status.done" as const,
  },
  in_progress: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900",
    labelKey: "status.inProgress" as const,
  },
  pending: {
    icon: Circle,
    color: "text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-950/20",
    border: "border-gray-200 dark:border-gray-700",
    labelKey: "status.pending" as const,
  },
};

export default function LegalChecklistPage() {
  const t = useTranslations("legalChecklist");

  const checklist: ChecklistItem[] = [
    {
      id: "cookieBanner",
      status: "done",
      link: "/",
    },
    {
      id: "privacyPolicy",
      status: "done",
      link: "/legal/privacy",
    },
    {
      id: "termsService",
      status: "done",
      link: "/legal/terms",
    },
    {
      id: "cookiePolicy",
      status: "done",
      link: "/legal/cookies",
    },
    {
      id: "aiTransparency",
      status: "done",
    },
    {
      id: "termsAcceptance",
      status: "done",
    },
    {
      id: "cookieDb",
      status: "done",
    },
    {
      id: "ipRetention",
      status: "done",
    },
    {
      id: "dsarApis",
      status: "pending",
    },
  ];

  const done = checklist.filter((item) => item.status === "done").length;
  const total = checklist.length;
  const progress = Math.round((done / total) * 100);

  const handleTestCookieBanner = () => {
    localStorage.removeItem("dottorio_cookie_consent");
    window.location.reload();
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToHome")}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 p-6 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">{t("totalProgress")}</span>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t("progressInfo", { done, total })}
        </p>
      </div>

      {/* Test Cookie Banner Button */}
      <div className="mb-8 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-4">
          <Cookie className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
              {t("testBanner.title")}
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
              {t("testBanner.description")}
            </p>
            <Button
              onClick={handleTestCookieBanner}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
            >
              <Cookie className="w-4 h-4 mr-2" />
              {t("testBanner.button")}
            </Button>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {checklist.map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-lg border ${config.border} ${config.bg}`}
            >
              <div className="flex items-start gap-4">
                <Icon className={`w-6 h-6 ${config.color} mt-0.5 shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-base">
                        {t(`items.${item.id}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t(`items.${item.id}.description`)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${config.color}`}>
                      {t(config.labelKey)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {t(`items.${item.id}.regulation`)}
                    </span>
                    {item.link && (
                      <Link
                        href={item.link}
                        className="text-xs text-primary hover:underline"
                      >
                        {t("viewPage")} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 rounded-lg bg-muted/30 border">
        <p className="text-sm text-muted-foreground">
          <strong>{t("footer.note")}:</strong> {t("footer.description")}
        </p>
      </div>
    </div>
  );
}
