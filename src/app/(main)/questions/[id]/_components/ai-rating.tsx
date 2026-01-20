"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface AiRatingProps {
  aiAnswerId: string;
  initialRating?: number | null;
  initialFeedback?: string | null;
  onRatingSubmit?: () => void;
}

export function AiRating({
  aiAnswerId,
  initialRating = null,
  initialFeedback = null,
  onRatingSubmit,
}: AiRatingProps) {
  const t = useTranslations("aiAnswer");
  const tCommon = useTranslations("common");

  const [rating, setRating] = useState<number | null>(initialRating);
  const [feedback, setFeedback] = useState(initialFeedback || "");
  const [showFeedbackInput, setShowFeedbackInput] = useState(
    initialRating ? initialRating < 3 : false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = async (newRating: number) => {
    setRating(newRating);

    if (newRating < 3) {
      setShowFeedbackInput(true);
    } else {
      setShowFeedbackInput(false);
      setFeedback("");
      // Auto-submit for ratings >= 3
      await submitRating(newRating, "");
    }
  };

  const submitRating = async (ratingValue: number, feedbackValue: string) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/ai-answers/${aiAnswerId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: ratingValue,
          feedback: feedbackValue || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore nella valutazione");
      }

      toast.success(t("thankYou"));
      onRatingSubmit?.();
    } catch (error) {
      toast.error(tCommon("error"));
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (rating && rating < 3 && feedback.trim()) {
      await submitRating(rating, feedback);
      setShowFeedbackInput(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">{t("rate")}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className="transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  rating && star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground hover:text-yellow-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {showFeedbackInput && rating && rating < 3 && (
        <div className="space-y-2 pt-2 border-t border-border animate-slide-in-up">
          <label className="text-sm font-medium">{t("feedbackLabel")}</label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t("feedbackPlaceholder")}
            className="min-h-[80px] text-sm"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowFeedbackInput(false);
                setFeedback("");
              }}
              disabled={isSubmitting}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitFeedback}
              disabled={!feedback.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? tCommon("loading") : t("submitFeedback")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
