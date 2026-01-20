"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronRight, Bookmark, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Question {
  id: string;
  text: string;
  views: number;
  exam: {
    subject: { name: string };
    professor: { name: string } | null;
    university: { name: string };
  };
}

interface ProfileTabsProps {
  savedQuestions: Question[];
  contributions: Question[];
}

export function ProfileTabs({ savedQuestions, contributions }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"saved" | "contributions">("saved");
  const t = useTranslations("profile");

  return (
    <Card>
      <CardContent className="p-6">
        {/* Tab Headers */}
        <div className="flex gap-6 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("contributions")}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === "contributions"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("myContributions")}
            {activeTab === "contributions" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === "saved"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("savedQuestions")}
            {activeTab === "saved" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Tab Content - Domande Salvate */}
        {activeTab === "saved" && (
          <div className="space-y-6">
            {savedQuestions.length > 0 ? (
              savedQuestions.map((question) => (
                <div key={question.id} className="border-b border-border last:border-b-0 pb-6 last:pb-0">
                  <h3 className="text-base font-medium text-foreground mb-3 leading-relaxed">
                    {question.text}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-primary text-white text-xs px-3 py-1">
                        {question.exam.subject.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-3 py-1">
                        {question.exam.professor?.name || "N/A"}
                      </Badge>
                      {question.exam.university.name && (
                        <Badge variant="outline" className="text-xs px-3 py-1">
                          {question.exam.university.name}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{question.views} {t("visualizations")}</span>
                      </div>
                    </div>

                    <Link
                      href={`/questions/${question.id}`}
                      className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 font-medium whitespace-nowrap"
                    >
                      {t("viewDetails")}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">
                  {t("noSavedQuestions")}
                </p>
                <Link href="/search">
                  <Button className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t("exploreQuestions")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab Content - I Miei Contributi */}
        {activeTab === "contributions" && (
          <div className="space-y-6">
            {contributions.length > 0 ? (
              contributions.map((question) => (
                <div key={question.id} className="border-b border-border last:border-b-0 pb-6 last:pb-0">
                  <h3 className="text-base font-medium text-foreground mb-3 leading-relaxed">
                    {question.text}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-primary text-white text-xs px-3 py-1">
                        {question.exam.subject.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-3 py-1">
                        {question.exam.professor?.name || "N/A"}
                      </Badge>
                      {question.exam.university.name && (
                        <Badge variant="outline" className="text-xs px-3 py-1">
                          {question.exam.university.name}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{question.views} {t("visualizations")}</span>
                      </div>
                    </div>

                    <Link
                      href={`/questions/${question.id}`}
                      className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 font-medium whitespace-nowrap"
                    >
                      {t("viewDetails")}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">
                  {t("noContributions")}
                </p>
                <Link href="/search">
                  <Button className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t("startContributing")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
