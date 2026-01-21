"use client";

import { useState, useEffect } from "react";
import { BookOpen, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AiRating } from "./ai-rating";
import { AiAnswerBadge } from "@/components/legal";

interface AiAnswerData {
  id: string;
  questionId: string;
  content: string;
  source: string | null;
  model: string | null;
  averageRating: number | null;
  ratingsCount: number;
  createdAt: string;
}

interface AiAnswerTabProps {
  questionId: string;
}

export function AiAnswerTab({ questionId }: AiAnswerTabProps) {
  const t = useTranslations("aiAnswer");
  const tCommon = useTranslations("common");

  const [aiAnswer, setAiAnswer] = useState<AiAnswerData | null>(null);
  const [userRating, setUserRating] = useState<{
    rating: number;
    feedback: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAiAnswer();
  }, [questionId]);

  const loadAiAnswer = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/questions/${questionId}/ai-answer`);

      if (response.status === 404) {
        setAiAnswer(null);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Errore nel caricamento");
      }

      const result = await response.json();
      setAiAnswer(result.data);

      // Load user's rating if answer exists
      if (result.data?.id) {
        loadUserRating(result.data.id);
      }
    } catch (error) {
      console.error("Error loading AI answer:", error);
      toast.error(tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRating = async (aiAnswerId: string) => {
    try {
      const response = await fetch(`/api/ai-answers/${aiAnswerId}/rate`);

      if (response.ok) {
        const result = await response.json();
        setUserRating(result.data);
      }
    } catch (error) {
      console.error("Error loading user rating:", error);
    }
  };

  const handleCopy = async () => {
    if (!aiAnswer?.content) return;

    try {
      await navigator.clipboard.writeText(aiAnswer.content);
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(tCommon("error"));
      console.error("Failed to copy:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!aiAnswer) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground mb-2">{t("noAnswer")}</p>
        <p className="text-sm text-muted-foreground">{t("noAnswerDescription")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Badge */}
      <div className="flex justify-center">
        <AiAnswerBadge />
      </div>

      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 border-l-4 border-primary pl-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-medium text-foreground">{t("title")}</h2>
            {aiAnswer.averageRating && aiAnswer.ratingsCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {t("avgRating")}: {aiAnswer.averageRating.toFixed(1)} ({aiAnswer.ratingsCount}{" "}
                {aiAnswer.ratingsCount === 1 ? "valutazione" : "valutazioni"})
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {t("copied")}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              {t("copy")}
            </>
          )}
        </Button>
      </div>

      {/* Rating Component */}
      <AiRating
        aiAnswerId={aiAnswer.id}
        initialRating={userRating?.rating}
        initialFeedback={userRating?.feedback}
        onRatingSubmit={() => loadAiAnswer()}
      />

      {/* AI Answer Content */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div
          className="space-y-4 text-sm leading-relaxed text-foreground"
          dangerouslySetInnerHTML={{ __html: aiAnswer.content }}
        />
      </div>

      {/* Source */}
      {aiAnswer.source && (
        <Alert>
          <AlertDescription className="text-sm text-muted-foreground">
            <strong>{t("source")}:</strong> {aiAnswer.source}
          </AlertDescription>
        </Alert>
      )}

      {/* Model Badge */}
      {aiAnswer.model && (
        <div className="flex justify-end">
          <Badge variant="outline" className="text-xs">
            {aiAnswer.model}
          </Badge>
        </div>
      )}
    </div>
  );
}
