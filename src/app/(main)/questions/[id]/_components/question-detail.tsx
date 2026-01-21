"use client";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { CommentsSection } from "./comments-section";
import { QuestionDialogs } from "./question-dialogs";
import { QuestionHeader } from "./question-header";
import { QuestionSidebar } from "./question-sidebar";
import { QuestionTabs } from "./question-tabs";
import type { CommentSort, QuestionDetailProps } from "./types";

/**
 * QuestionDetail - Main layout component for question page
 *
 * Refactored from 1,624 lines to ~180 lines by extracting:
 * - Header (QuestionHeader)
 * - Sidebar (QuestionSidebar)
 * - Tabs (QuestionTabs)
 * - Comments (CommentsSection)
 * - Dialogs (QuestionDialogs)
 *
 * Responsibilities:
 * - 3-column responsive layout
 * - Modal state management
 * - Composition of child components
 * - Pass key={question.id} to force remount on question change
 */
export const QuestionDetail = memo(function QuestionDetail({
  question,
  relatedQuestions,
  variations,
  userId,
  onNavigate,
  onQuestionHover,
}: QuestionDetailProps) {
  const t = useTranslations("question");

  // Modal states
  const [isVariationsDialogOpen, setIsVariationsDialogOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Comment sort state (for desktop sidebar)
  const [commentSort, setCommentSort] = useState<CommentSort>("likes");

  // Variations info
  const variationsCount = variations.length + 1;
  const hasVariations = variations.length > 0;

  return (
    <>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
          {/* Header - Fixed */}
          <QuestionHeader
            question={question}
            relatedQuestions={relatedQuestions}
            currentIsSaved={question.isSaved}
            onNavigate={onNavigate}
            onQuestionHover={onQuestionHover}
          />

          {/* 3 Column Layout - Fixed height with internal scroll */}
          <div className="grid grid-cols-12 gap-4 md:gap-6 flex-1 overflow-hidden px-4 md:px-6 pb-4 md:pb-6">
            {/* Left Column - Related Questions Sidebar (Desktop only) */}
            <QuestionSidebar
              question={question}
              relatedQuestions={relatedQuestions}
              currentIsSaved={question.isSaved}
              hasVariations={hasVariations}
              variationsCount={variationsCount}
              onNavigate={onNavigate}
              onQuestionHover={onQuestionHover}
              onVariationsClick={() => setIsVariationsDialogOpen(true)}
            />

            {/* Center Column - Question Tabs */}
            <QuestionTabs
              key={`tabs-${question.id}`} // Force remount when question changes
              question={question}
              userId={userId}
              onLinkClick={() => setIsLinkModalOpen(true)}
              onReportClick={() => setIsReportModalOpen(true)}
            />

            {/* Right Column - Comments (Desktop only) */}
            <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border flex-col h-full overflow-hidden">
              {/* Comments Header */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{t("experiences.title")}</h3>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2.5">
                    {question._count.comments}
                  </Badge>
                </div>
                <Select
                  value={commentSort}
                  onValueChange={(v) => setCommentSort(v as CommentSort)}
                >
                  <SelectTrigger className="h-9 text-sm border-2">
                    <SelectValue>
                      {commentSort === "likes"
                        ? t("experiences.sortByLikes")
                        : t("experiences.sortByRecent")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="likes">{t("experiences.sortByLikes")}</SelectItem>
                    <SelectItem value="recent">{t("experiences.sortByRecent")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto">
                <CommentsSection
                  key={`comments-${question.id}`} // Force remount when question changes
                  questionId={question.id}
                  initialComments={question.comments}
                  userId={userId}
                  isDesktop
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <QuestionDialogs
        question={question}
        variations={variations}
        isVariationsOpen={isVariationsDialogOpen}
        onVariationsClose={() => setIsVariationsDialogOpen(false)}
        isLinkOpen={isLinkModalOpen}
        onLinkClose={() => setIsLinkModalOpen(false)}
        isReportOpen={isReportModalOpen}
        onReportClose={() => setIsReportModalOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
});
