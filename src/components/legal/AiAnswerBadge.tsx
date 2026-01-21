"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AiAnswerBadge() {
  const t = useTranslations("legal");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm font-medium cursor-help hover:bg-amber-100 transition-colors">
            <Sparkles className="w-4 h-4" />
            <span>{t("aiAnswer.badge")}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("aiAnswer.tooltipTitle")}</p>
            <p className="text-xs text-gray-600">
              {t("aiAnswer.tooltipDescription")}
            </p>
            <p className="text-xs font-semibold text-amber-700">
              ⚠️ {t("aiAnswer.warning")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AiAnswerDisclaimer() {
  const t = useTranslations("legal");

  return (
    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
      <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-medium text-amber-900">
          {t("aiAnswer.disclaimerTitle")}
        </p>
        <p className="text-amber-800 text-xs">
          {t("aiAnswer.disclaimerText")}
        </p>
      </div>
    </div>
  );
}
