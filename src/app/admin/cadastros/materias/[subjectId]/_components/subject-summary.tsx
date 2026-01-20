"use client";

import { useTranslations } from "next-intl";
import { Calendar, BookOpen, Award, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SubjectSummaryProps {
  year: number | null;
  semester: number | null;
  credits: number | null;
  examsCount: number;
  color: string | null;
}

const colorClasses: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  rose: "bg-rose-500",
  gray: "bg-gray-500",
};

export function SubjectSummary({
  year,
  semester,
  credits,
  examsCount,
  color,
}: SubjectSummaryProps) {
  const t = useTranslations("admin.professorsPage");

  const colorClass = color ? colorClasses[color] || "bg-gray-500" : "bg-gray-500";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className={`h-4 w-4 rounded-full ${colorClass}`} />
          <span className="font-medium text-muted-foreground">
            {t("subjectSummary")}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("year")}</p>
              <p className="font-medium">
                {year ? `${year}° anno` : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("semester")}</p>
              <p className="font-medium">
                {semester ? `${semester}° semestre` : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Award className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("credits")}</p>
              <p className="font-medium">
                {credits ? `${credits} CFU` : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("exams")}</p>
              <p className="font-medium">{examsCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
