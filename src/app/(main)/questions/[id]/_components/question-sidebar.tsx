"use client";

import { useState, useMemo, memo, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { BookmarkCheck, GitBranch } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Question, RelatedQuestion, QuestionFilter, QuestionSort } from "./types";

interface QuestionSidebarProps {
  question: Question;
  relatedQuestions: RelatedQuestion[];
  currentIsSaved: boolean;
  hasVariations: boolean;
  variationsCount: number;
  onNavigate: (id: string) => void;
  onQuestionHover?: (id: string) => void;
  onVariationsClick: () => void;
}

/**
 * QuestionSidebar - Left sidebar with related questions list
 *
 * Features:
 * - Filter by all/saved questions
 * - Sort by views/recent
 * - Highlight current question
 * - Show variations badge
 * - Infinite scroll support
 * - Prefetch on hover
 */
export const QuestionSidebar = memo(function QuestionSidebar({
  question,
  relatedQuestions,
  currentIsSaved,
  hasVariations,
  variationsCount,
  onNavigate,
  onQuestionHover,
  onVariationsClick,
}: QuestionSidebarProps) {
  const t = useTranslations("question");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  const [filter, setFilter] = useState<QuestionFilter>("all");
  const [sort, setSort] = useState<QuestionSort>("views");

  // Save scroll position before question changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      scrollPositionRef.current = container.scrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position after question changes
  useEffect(() => {
    console.log('[DEBUG Sidebar] Question changed to:', question.id);
    console.log('[DEBUG Sidebar] Saved scroll position:', scrollPositionRef.current);
    console.log('[DEBUG Sidebar] Related questions count:', relatedQuestions.length);

    const container = scrollContainerRef.current;
    if (container && scrollPositionRef.current > 0) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        console.log('[DEBUG Sidebar] Restoring scroll to:', scrollPositionRef.current);
        container.scrollTop = scrollPositionRef.current;
        console.log('[DEBUG Sidebar] Actual scroll after restore:', container.scrollTop);
      }, 100); // Increased timeout
    }
  }, [question.id, relatedQuestions.length]);

  // Build all questions list
  // DON'T rebuild on question change - just use relatedQuestions as-is
  // This keeps the list order stable and preserves scroll position
  const allQuestions = useMemo(() => {
    return relatedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      views: q.views,
      professor: q.exam.professor?.name || "N/A",
      // Use currentIsSaved for the current question, otherwise use q.isSaved
      isSaved: q.id === question.id ? currentIsSaved : (q.isSaved || false),
      isCurrent: q.id === question.id,
    }));
  }, [relatedQuestions, question.id, currentIsSaved]);

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

    return filtered;
  }, [allQuestions, filter, sort]);


  return (
    <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border flex-col h-full overflow-hidden">
      {/* Header with Filters */}
      <div className="p-4 border-b border-border bg-muted/30 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">
            {t("sidebar.questions", { subject: question.exam.subject.name })}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t("sidebar.questionsCount", {
              shown: filteredQuestions.length,
              total: filteredQuestions.length,
            })}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="space-y-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as QuestionFilter)}>
            <SelectTrigger className="h-9 text-sm border-2">
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
            <SelectTrigger className="h-9 text-sm border-2">
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
      </div>

      {/* Questions List */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto divide-y divide-border">
        {filteredQuestions.map((q) => (
          <button
            key={q.id}
            onClick={() => {
              if (q.id !== question.id) {
                onNavigate(q.id);
              }
            }}
            onMouseEnter={() => onQuestionHover?.(q.id)}
            className={`w-full text-left p-4 transition-all hover:bg-muted/50 ${
              q.id === question.id
                ? "bg-primary/10 border-l-4 border-l-primary"
                : "border-l-4 border-l-transparent"
            }`}
          >
            {/* Question Text */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <p
                className={`text-sm line-clamp-2 leading-relaxed ${
                  q.id === question.id ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                {q.text}
              </p>
              {q.isSaved && <BookmarkCheck className="w-4 h-4 text-primary flex-shrink-0" />}
            </div>

            {/* Professor and Variations Badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{q.professor}</span>
              {hasVariations && q.isCurrent && (
                <>
                  <span>•</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onVariationsClick();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        onVariationsClick();
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 transition-all duration-200 border border-primary/30 hover:border-primary cursor-pointer"
                    title={t("variations.title")}
                  >
                    <GitBranch className="w-3 h-3" />
                    <span className="font-medium">{variationsCount}x</span>
                  </span>
                </>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
