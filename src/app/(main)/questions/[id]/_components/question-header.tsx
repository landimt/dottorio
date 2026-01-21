"use client";

import { useState, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ChevronDown, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Question, RelatedQuestion, QuestionFilter, QuestionSort } from "./types";

interface QuestionHeaderProps {
  question: Question;
  relatedQuestions: RelatedQuestion[];
  currentIsSaved: boolean;
  onNavigate: (id: string) => void;
  onQuestionHover?: (id: string) => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

/**
 * QuestionHeader - Header with back button and mobile question selector
 *
 * Features:
 * - Back to Search button
 * - Mobile dropdown for question navigation with filters
 * - Question counter (X / Total)
 * - Subject info display
 */
export const QuestionHeader = memo(function QuestionHeader({
  question,
  relatedQuestions,
  currentIsSaved,
  onNavigate,
  onQuestionHover,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: QuestionHeaderProps) {
  const router = useRouter();
  const t = useTranslations("question");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filter, setFilter] = useState<QuestionFilter>("all");
  const [sort, setSort] = useState<QuestionSort>("views");

  // Build all questions list (current + related)
  const allQuestions = useMemo(() => {
    return [
      {
        id: question.id,
        text: question.text,
        views: question.views,
        professor: question.exam.professor?.name || "N/A",
        isSaved: currentIsSaved,
        isCurrent: true,
      },
      // Filter out current question to avoid duplicates
      ...relatedQuestions
        .filter((q) => q.id !== question.id)
        .map((q) => ({
          id: q.id,
          text: q.text,
          views: q.views,
          professor: q.exam.professor?.name || "N/A",
          isSaved: q.isSaved || false,
          isCurrent: false,
        })),
    ];
  }, [question, relatedQuestions, currentIsSaved]);

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = [...allQuestions];

    // Apply filter
    if (filter === "saved") {
      filtered = filtered.filter((q) => q.isSaved);
    }

    // Apply sorting
    if (sort === "views") {
      filtered.sort((a, b) => b.views - a.views);
    }
    // 'recent' keeps default order from API

    return filtered;
  }, [allQuestions, filter, sort]);

  const currentIndex = filteredQuestions.findIndex((q) => q.id === question.id);

  return (
    <div className="p-4 md:p-6 shrink-0">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push("/search")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("backToSearch")}
      </Button>

      {/* Mobile Question Selector */}
      <div className="md:hidden mb-4">
        <Card className="p-3 bg-linear-to-br from-card to-muted border-2">
          {/* Subject Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">
              {question.exam.subject.emoji} {question.exam.subject.name}
            </h3>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs px-2 py-0.5"
            >
              {currentIndex + 1} / {filteredQuestions.length}
            </Badge>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Select value={filter} onValueChange={(v) => setFilter(v as QuestionFilter)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue>
                  {filter === "all" ? t("sidebar.filterAll") : t("sidebar.filterSaved")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("sidebar.filterAll")}</SelectItem>
                <SelectItem value="saved">{t("sidebar.filterSaved")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as QuestionSort)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue>
                  {sort === "views" ? t("sidebar.sortViews") : t("sidebar.sortRecent")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">{t("sidebar.sortViews")}</SelectItem>
                <SelectItem value="recent">{t("sidebar.sortRecent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-auto min-h-[40px] text-sm px-3 py-2 rounded-md border-2 border-border bg-card text-foreground font-medium hover:border-primary transition-all flex items-center justify-between gap-2 text-left"
            >
              <span className="flex-1 leading-relaxed">
                {currentIndex + 1}. {question.text}
                <span className="block text-xs text-muted-foreground mt-1">
                  {question.exam.professor?.name || "N/A"}
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown List */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-lg shadow-xl z-20 max-h-[300px] overflow-y-auto">
                  {filteredQuestions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        if (q.id !== question.id) {
                          onNavigate(q.id);
                        }
                        setIsDropdownOpen(false);
                      }}
                      onMouseEnter={() => onQuestionHover?.(q.id)}
                      className={`w-full px-3 py-3 text-sm text-left hover:bg-primary/5 transition-colors border-b border-border last:border-b-0 flex items-start gap-2 ${
                        q.id === question.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <span className="font-semibold text-primary flex-shrink-0 min-w-[24px]">
                        {index + 1}.
                      </span>
                      <span className="flex-1 leading-relaxed">{q.text}</span>
                      {q.isSaved && (
                        <BookmarkCheck className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}

                  {/* Infinite scroll trigger for mobile */}
                  {hasNextPage && (
                    <div className="p-3 text-center border-t border-border">
                      {isFetchingNextPage ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span>Caricamento...</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchNextPage?.();
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Carica altro
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
});
