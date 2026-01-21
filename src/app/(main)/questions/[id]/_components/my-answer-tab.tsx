"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { StickyNote, CheckCircle, Globe, Lock, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ShareDialog } from "@/components/share-dialog";
import type { Question } from "./types";

interface MyAnswerTabProps {
  question: Question;
  userId?: string;
  onSwitchToAITab: () => void;
}

/**
 * MyAnswerTab - Personal answer editor with public/private toggle
 *
 * Features:
 * - Rich text editor for personal answers
 * - Public/private toggle
 * - Word count
 * - Save with ShareDialog
 * - CTA to compare with AI answer
 */
export function MyAnswerTab({ question, userId, onSwitchToAITab }: MyAnswerTabProps) {
  const t = useTranslations("question");
  const tCommon = useTranslations("common");

  const [personalAnswer, setPersonalAnswer] = useState(question.personalAnswer?.content || "");
  const [isEditing, setIsEditing] = useState(!question.personalAnswer);
  const [isPublic, setIsPublic] = useState(question.personalAnswer?.isPublic || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Calculate word count
  const wordCount = useMemo(() => {
    return personalAnswer.split(/\s+/).filter((word) => word.length > 0).length;
  }, [personalAnswer]);

  const handleSave = async (makePublic?: boolean) => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    if (!personalAnswer.trim()) return;

    // If makePublic is undefined, show dialog first
    if (makePublic === undefined) {
      setShowShareDialog(true);
      return;
    }

    setShowShareDialog(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/questions/${question.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: personalAnswer,
          isPublic: makePublic,
        }),
      });

      if (response.ok) {
        setIsPublic(makePublic);
        setIsEditing(false);
        toast.success(
          makePublic ? t("myAnswer.savedAndShared") : t("myAnswer.savedSuccess")
        );
      } else {
        toast.error(tCommon("error"));
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 border-l-4 border-accent pl-3">
          <StickyNote className="w-5 h-5 text-accent" />
          <h2 className="font-medium text-foreground">
            {isEditing ? t("myAnswer.writeTitle") : t("myAnswer.title")}
          </h2>
        </div>

        {!isEditing && personalAnswer && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="border-accent text-accent hover:bg-accent/10"
          >
            {tCommon("edit")}
          </Button>
        )}
      </div>

      {/* Editor / Content Display */}
      <div className="bg-muted/30 rounded-lg border border-border p-4">
        {isEditing ? (
          <RichTextEditor
            content={personalAnswer}
            onChange={setPersonalAnswer}
            placeholder={t("myAnswer.placeholder")}
            editable={true}
          />
        ) : (
          <div
            className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{
              __html:
                personalAnswer ||
                `<span class="text-muted-foreground">${t("myAnswer.noAnswer")}</span>`,
            }}
          />
        )}
      </div>

      {/* Save Controls (shown when editing and has content) */}
      {isEditing && personalAnswer.trim() && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              {/* Word Count */}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-dottorei-success" />
                <span className="text-sm text-muted-foreground">
                  {t("myAnswer.words", { count: wordCount })}
                </span>
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Public/Private Toggle */}
              <button
                onClick={() => setIsPublic(!isPublic)}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                {isPublic ? (
                  <>
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">{t("myAnswer.public")}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t("myAnswer.private")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Save Button */}
            <Button
              onClick={() => handleSave()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              size="sm"
              disabled={isSubmitting}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isSubmitting ? t("myAnswer.saving") : tCommon("save")}
            </Button>
          </div>

          {/* Public Notice */}
          {isPublic && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
              <Users className="w-4 h-4 text-primary mt-0.5" />
              <p className="text-sm text-primary">{t("myAnswer.publicNotice")}</p>
            </div>
          )}
        </div>
      )}

      {/* Saved State CTA */}
      {!isEditing && personalAnswer && (
        <div className="flex items-center justify-between p-3 bg-dottorei-success/10 rounded-lg border border-dottorei-success/20">
          <div className="flex items-center gap-2 text-sm text-dottorei-success">
            <CheckCircle className="w-4 h-4" />
            <span>
              {t("myAnswer.savedLabel")} • {t("myAnswer.words", { count: wordCount })}
            </span>
          </div>
          <Button
            onClick={onSwitchToAITab}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {t("myAnswer.compareWithAI")}
          </Button>
        </div>
      )}

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onConfirm={handleSave}
        onCancel={() => setShowShareDialog(false)}
      />
    </div>
  );
}
