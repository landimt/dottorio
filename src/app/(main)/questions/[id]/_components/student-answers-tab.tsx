"use client";

import { useState, memo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Users, ThumbsUp, Copy } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StudentAnswer } from "./types";

interface StudentAnswersTabProps {
  initialAnswers: StudentAnswer[];
  questionId: string;
  userId?: string;
}

/**
 * StudentAnswersTab - Display and interact with student answers
 *
 * Features:
 * - List of student answers with user info
 * - Like functionality with optimistic updates
 * - Copy answer to clipboard
 * - Empty state
 */
export const StudentAnswersTab = memo(function StudentAnswersTab({ initialAnswers, questionId, userId }: StudentAnswersTabProps) {
  const t = useTranslations("question");
  const tCommon = useTranslations("common");
  const tHeader = useTranslations("header");

  const [answers, setAnswers] = useState(initialAnswers);

  const handleToggleLike = useCallback(async (answerId: string) => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    // Optimistic update
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answerId
          ? {
              ...a,
              isLiked: !a.isLiked,
              likesCount: a.isLiked ? a.likesCount - 1 : a.likesCount + 1,
            }
          : a
      )
    );

    try {
      const response = await fetch(`/api/answers/${answerId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const { data } = await response.json();
        // Sync with server
        setAnswers((prev) =>
          prev.map((a) =>
            a.id === answerId ? { ...a, isLiked: data.liked, likesCount: data.likesCount } : a
          )
        );
      } else {
        // Rollback on error
        setAnswers((prev) =>
          prev.map((a) =>
            a.id === answerId
              ? {
                  ...a,
                  isLiked: !a.isLiked,
                  likesCount: a.isLiked ? a.likesCount + 1 : a.likesCount - 1,
                }
              : a
          )
        );
        toast.error(tCommon("error"));
      }
    } catch {
      // Rollback on error
      setAnswers((prev) =>
        prev.map((a) =>
          a.id === answerId
            ? {
                ...a,
                isLiked: !a.isLiked,
                likesCount: a.isLiked ? a.likesCount + 1 : a.likesCount - 1,
              }
            : a
        )
      );
      toast.error(tCommon("error"));
    }
  }, [userId, t, tCommon]);

  const handleCopyAnswer = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(tCommon("copied"));
  }, [tCommon]);

  const getInitials = useCallback((name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const getUniversityInfo = useCallback((universityName: string | undefined) => {
    if (!universityName)
      return {
        short: "N/A",
        colorClass: "text-primary bg-dottorei-light-blue border-primary/20",
      };

    const universityMap: Record<string, { short: string; colorClass: string }> = {
      "La Sapienza": {
        short: "Sapienza",
        colorClass: "text-dottorei-orange bg-dottorei-light-orange border-dottorei-orange/30",
      },
      "Università di Bologna": {
        short: "UniBO",
        colorClass: "text-accent bg-dottorei-light-primary border-accent/20",
      },
      "Università di Milano": {
        short: "UniMI",
        colorClass: "text-dottorei-blue bg-dottorei-light-blue border-dottorei-blue/30",
      },
    };

    return (
      universityMap[universityName] || {
        short: universityName.slice(0, 8),
        colorClass: "text-primary bg-dottorei-light-blue border-primary/20",
      }
    );
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 border-l-4 border-primary pl-3">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-medium text-foreground">{t("studentAnswers.title")}</h2>
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border">
        {t.rich("studentAnswers.description", {
          count: answers.length,
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </div>

      {/* Answers List */}
      {answers.length > 0 ? (
        <div className="space-y-4">
          {answers.map((answer) => {
            const uniInfo = getUniversityInfo(answer.user.university?.name);
            return (
              <Card key={answer.id} className="p-4 hover:shadow-md transition-shadow">
                {/* User Info */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(answer.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{answer.user.name}</span>
                      <Badge variant="outline" className={`text-xs border ${uniInfo.colorClass}`}>
                        {uniInfo.short}
                      </Badge>
                      {answer.user.year && (
                        <Badge variant="outline" className="text-xs bg-muted">
                          {tHeader("year", { year: answer.user.year })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer Content */}
                <div
                  className="prose prose-sm max-w-none text-sm text-foreground leading-relaxed mb-3"
                  dangerouslySetInnerHTML={{ __html: answer.content }}
                />

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleLike(answer.id)}
                    className={`h-8 ${
                      answer.isLiked ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 mr-2 ${answer.isLiked ? "fill-primary/30" : ""}`}
                    />
                    {answer.likesCount}{" "}
                    {answer.likesCount === 1 ? t("studentAnswers.like") : t("studentAnswers.likes")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyAnswer(answer.content)}
                    className="h-8"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {tCommon("copy")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground mb-2">{t("studentAnswers.noAnswers")}</p>
          <p className="text-sm text-muted-foreground">{t("studentAnswers.beFirst")}</p>
        </div>
      )}
    </div>
  );
});
