"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  BookOpen,
  Users,
  StickyNote,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Eye,
  MoreVertical,
  Link2,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiAnswerTab } from "./ai-answer-tab";
import { StudentAnswersTab } from "./student-answers-tab";
import { MyAnswerTab } from "./my-answer-tab";
import { CommentsSection } from "./comments-section";
import type { Question } from "./types";

interface QuestionTabsProps {
  question: Question;
  userId?: string;
  onLinkClick: () => void;
  onReportClick: () => void;
}

/**
 * QuestionTabs - Central tabs component with question header
 *
 * Features:
 * - Question title and metadata
 * - Save button with optimistic updates
 * - More menu (link, report)
 * - Tab navigation (AI, Student Answers, My Answer, Comments)
 * - Composition of tab content components
 */
export function QuestionTabs({ question, userId, onLinkClick, onReportClick }: QuestionTabsProps) {
  const t = useTranslations("question");
  const tCommon = useTranslations("common");

  const [activeTab, setActiveTab] = useState<
    "ai-answer" | "student-answers" | "my-answer" | "comments"
  >("ai-answer");
  const [saved, setSaved] = useState(question.isSaved);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async () => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    setIsSaving(true);

    // Optimistic update
    setSaved(!saved);

    try {
      const response = await fetch(`/api/questions/${question.id}/save`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success(saved ? t("removedFromSaved") : t("addedToSaved"));
      } else {
        // Rollback on error
        setSaved(saved);
        toast.error(tCommon("error"));
      }
    } catch {
      // Rollback on error
      setSaved(saved);
      toast.error(tCommon("error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="col-span-12 md:col-span-6 bg-card rounded-lg border border-border flex flex-col h-full overflow-hidden">
      {/* Question Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4 gap-2">
          <h1 className="text-lg md:text-xl font-semibold text-foreground flex-1">
            {question.text}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            {/* Save Button */}
            <Button
              variant={saved ? "default" : "outline"}
              size="sm"
              onClick={handleToggleSave}
              disabled={isSaving}
              className="gap-2"
            >
              {saved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span className="hidden md:inline">{saved ? t("saved") : t("save")}</span>
            </Button>

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onLinkClick}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Vincolar questão
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReportClick}>
                  <Flag className="w-4 h-4 mr-2" />
                  Denunciar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Question Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {question.exam.professor?.name || "N/A"}
          </Badge>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            {question.exam.university.name}
          </Badge>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{t("views", { count: question.views })}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-2 md:grid-cols-3 gap-1">
            <TabsTrigger
              value="ai-answer"
              className="flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t("tabs.aiAnswer")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="student-answers"
              className="flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>{t("tabs.studentAnswers")}</span>
              <span className="text-xs text-muted-foreground">
                {question._count.studentAnswers}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="my-answer"
              className="flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <StickyNote className="w-4 h-4" />
              <span>{t("tabs.myAnswer")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="col-span-2 md:hidden flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t("tabs.experiences")}</span>
              <span className="text-xs text-muted-foreground">{question._count.comments}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="ai-answer" className="space-y-4 mt-0">
            <AiAnswerTab questionId={question.id} />
          </TabsContent>

          <TabsContent value="student-answers" className="space-y-4 mt-0">
            <StudentAnswersTab
              initialAnswers={question.studentAnswers}
              questionId={question.id}
              userId={userId}
            />
          </TabsContent>

          <TabsContent value="my-answer" className="space-y-4 mt-0">
            <MyAnswerTab
              question={question}
              userId={userId}
              onSwitchToAITab={() => setActiveTab("ai-answer")}
            />
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-0 md:hidden">
            <CommentsSection
              questionId={question.id}
              initialComments={question.comments}
              userId={userId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
