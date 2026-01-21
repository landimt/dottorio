"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, ThumbsUp, Send } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Comment, CommentSort } from "./types";

interface CommentsSectionProps {
  questionId: string;
  initialComments: Comment[];
  userId?: string;
  isDesktop?: boolean;
}

/**
 * CommentsSection - Display and manage comments (experiences)
 *
 * Features:
 * - List comments with sorting (likes/recent)
 * - Like functionality with optimistic updates
 * - Add new comment
 * - Different layouts for desktop vs mobile
 */
export function CommentsSection({
  questionId,
  initialComments,
  userId,
  isDesktop = false,
}: CommentsSectionProps) {
  const t = useTranslations("question");
  const tCommon = useTranslations("common");

  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<CommentSort>("likes");

  // Sort comments
  const sortedComments = useMemo(() => {
    const sorted = [...comments];
    if (sortBy === "likes") {
      return sorted.sort((a, b) => b.likesCount - a.likesCount);
    }
    return sorted.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments, sortBy]);

  const handleToggleLike = async (commentId: string) => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    // Optimistic update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              isLiked: !c.isLiked,
              likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
            }
          : c
      )
    );

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const { data } = await response.json();
        // Sync with server
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, isLiked: data.liked, likesCount: data.likesCount } : c
          )
        );
      } else {
        // Rollback on error
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  isLiked: !c.isLiked,
                  likesCount: c.isLiked ? c.likesCount + 1 : c.likesCount - 1,
                }
              : c
          )
        );
        toast.error(tCommon("error"));
      }
    } catch {
      // Rollback on error
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likesCount: c.isLiked ? c.likesCount + 1 : c.likesCount - 1,
              }
            : c
        )
      );
      toast.error(tCommon("error"));
    }
  };

  const handlePublish = async () => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/questions/${questionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const { data: comment } = await response.json();
        // Optimistic add
        setComments((prev) => [
          {
            ...comment,
            isLiked: false,
            likesCount: 0,
          },
          ...prev,
        ]);
        setNewComment("");
        toast.success(t("experiences.published"));
      } else {
        toast.error(tCommon("error"));
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUniversityInfo = (universityName: string | undefined) => {
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
  };

  return (
    <div className={isDesktop ? "flex flex-col h-full" : "space-y-4"}>
      {/* Mobile Header with Sort */}
      {!isDesktop && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 border-l-4 border-primary pl-3">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h2 className="font-medium text-foreground">{t("experiences.title")}</h2>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as CommentSort)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue>
                  {sortBy === "likes"
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

          {/* Tips */}
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border">
            {t("experiences.description")}
          </div>
        </>
      )}

      {/* Comments List */}
      <div className={isDesktop ? "flex-1 overflow-y-auto p-4 space-y-4" : "space-y-4"}>
        {sortedComments.map((comment) => {
          const uniInfo = getUniversityInfo(comment.user.university?.name);
          return (
            <div
              key={comment.id}
              className={isDesktop ? "pb-4 border-b border-border last:border-b-0" : ""}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  {/* User Info */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-foreground">{comment.user.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs rounded-full px-2 border ${uniInfo.colorClass}`}
                    >
                      {uniInfo.short}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div
                    className="prose prose-sm max-w-none text-sm text-foreground leading-relaxed mb-3"
                    dangerouslySetInnerHTML={{ __html: comment.content }}
                  />

                  {/* Like and Date */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button
                      onClick={() => handleToggleLike(comment.id)}
                      className={`flex items-center gap-1.5 hover:text-foreground transition-colors ${
                        comment.isLiked ? "text-primary" : ""
                      }`}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${comment.isLiked ? "fill-current" : ""}`}
                      />
                      <span>{comment.likesCount}</span>
                    </button>
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString("it-IT", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {sortedComments.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">{t("experiences.noExperiences")}</p>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className={isDesktop ? "p-4 border-t border-border" : ""}>
        <div className="space-y-3">
          {!isDesktop && (
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>{t("experiences.shareYours")}</span>
            </div>
          )}
          <Textarea
            placeholder={t("experiences.placeholder")}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] text-sm resize-none border-2"
          />
          <div className="flex justify-end">
            <Button
              onClick={handlePublish}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6"
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? t("experiences.publishing") : t("experiences.publish")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
