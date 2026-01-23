"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookmarkCheck, GitBranch } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RelatedQuestion, QuestionFilter, QuestionSort } from "./types";

// Module-level scroll position storage - persists across re-renders and remounts
const scrollPositionBySubject: Record<string, number> = {};

interface QuestionSidebarProps {
  subjectName: string;
  subjectId: string;
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
 * SCROLL PRESERVATION:
 * - Stores scroll position in module-level variable (survives remounts)
 * - Restores position after any re-render
 * - Uses subjectId as key to separate scroll positions per subject
 */
export function QuestionSidebar({
  subjectName,
  subjectId,
  relatedQuestions,
  currentIsSaved,
  hasVariations,
  variationsCount,
  onNavigate,
  onQuestionHover,
  onVariationsClick,
}: QuestionSidebarProps) {
  const t = useTranslations("question");
  const params = useParams();
  const currentQuestionId = params.id as string;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRestoringScroll = useRef(false);

  const [filter, setFilter] = useState<QuestionFilter>("all");
  const [sort, setSort] = useState<QuestionSort>("views");

  // Save scroll position on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !subjectId) return;

    const handleScroll = () => {
      if (!isRestoringScroll.current) {
        scrollPositionBySubject[subjectId] = container.scrollTop;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [subjectId]);

  // Restore scroll position after render
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !subjectId) return;

    const savedPosition = scrollPositionBySubject[subjectId];
    if (savedPosition && savedPosition > 0) {
      isRestoringScroll.current = true;
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        container.scrollTop = savedPosition;
        // Reset flag after a short delay
        setTimeout(() => {
          isRestoringScroll.current = false;
        }, 50);
      });
    }
  }); // Run after every render

  // Build questions list
  const allQuestions = useMemo(() => {
    return relatedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      views: q.views,
      professor: q.exam.professor?.name || "N/A",
      isSaved: q.isSaved || false,
    }));
  }, [relatedQuestions]);

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = [...allQuestions];

    if (filter === "saved") {
      filtered = filtered.filter((q) => q.isSaved);
    }

    if (sort === "views") {
      filtered.sort((a, b) => b.views - a.views);
    }

    return filtered;
  }, [allQuestions, filter, sort]);

  // Stable handlers using refs
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  const handleClick = useCallback((id: string) => {
    if (id !== currentQuestionId) {
      onNavigateRef.current(id);
    }
  }, [currentQuestionId]);

  const onQuestionHoverRef = useRef(onQuestionHover);
  onQuestionHoverRef.current = onQuestionHover;

  const handleHover = useCallback((id: string) => {
    onQuestionHoverRef.current?.(id);
  }, []);

  const onVariationsClickRef = useRef(onVariationsClick);
  onVariationsClickRef.current = onVariationsClick;

  const handleVariationsClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onVariationsClickRef.current();
  }, []);

  return (
    <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border flex-col h-full overflow-hidden">
      {/* Header with Filters */}
      <div className="p-4 border-b border-border bg-muted/30 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">
            {t("sidebar.questions", { subject: subjectName })}
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
        {filteredQuestions.map((q) => {
          const isCurrent = q.id === currentQuestionId;
          return (
            <button
              key={q.id}
              onClick={() => handleClick(q.id)}
              onMouseEnter={() => handleHover(q.id)}
              className={`w-full text-left p-4 transition-colors hover:bg-muted/50 border-l-4 ${
                isCurrent
                  ? "bg-primary/10 border-l-primary"
                  : "border-l-transparent"
              }`}
            >
              {/* Question Text */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p
                  className={`text-sm line-clamp-2 leading-relaxed ${
                    isCurrent ? "text-primary font-medium" : "text-foreground"
                  }`}
                >
                  {q.text}
                </p>
                {(isCurrent ? currentIsSaved : q.isSaved) && (
                  <BookmarkCheck className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>

              {/* Professor and Variations Badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{q.professor}</span>
                {hasVariations && isCurrent && (
                  <>
                    <span>•</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={handleVariationsClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleVariationsClick(e);
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
          );
        })}
      </div>
    </div>
  );
}
