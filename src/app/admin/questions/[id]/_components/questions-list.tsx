"use client";

import { Bot, Eye, MessageSquare, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Question {
  id: string;
  text: string;
  views: number;
  timesAsked: number;
  exam: {
    subject: { name: string; emoji: string | null };
    professor: { name: string } | null;
    university: { shortName: string | null; name: string };
    year: number | null;
  };
  aiAnswer: { id: string } | null;
  _count: {
    comments: number;
  };
}

interface QuestionsListProps {
  questions: Question[];
  selectedQuestionId: string;
  onSelectQuestion: (questionId: string) => void;
}

export function QuestionsList({
  questions,
  selectedQuestionId,
  onSelectQuestion,
}: QuestionsListProps) {
  const t = useTranslations("admin.questionDetail");

  if (questions.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {t("noQuestionsFound")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((question) => (
          <button
            key={question.id}
            onClick={() => onSelectQuestion(question.id)}
            className={cn(
              "w-full text-left p-3 rounded-md transition-all border shadow-sm",
              selectedQuestionId === question.id
                ? "bg-primary/10 border-l-4 border-primary ring-1 ring-primary/20"
                : "bg-muted/30 border-border hover:bg-muted/50 hover:border-muted hover:shadow"
            )}
          >
            {/* Question Text */}
            <p className="text-sm font-medium line-clamp-2 mb-2 leading-snug">
              {question.text}
            </p>

            {/* Subject and Professor */}
            <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {question.exam.subject.emoji && <span>{question.exam.subject.emoji}</span>}
                <span className="font-medium">{question.exam.subject.name}</span>
              </span>
              {question.exam.professor && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="truncate">{question.exam.professor.name}</span>
                </>
              )}
            </div>

            {/* University and Year */}
            <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
              <span className="truncate">
                {question.exam.university.shortName || question.exam.university.name}
              </span>
              {question.exam.year && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{question.exam.year}º Anno</span>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-muted/40">
              <span className="flex items-center gap-1" title="Visualizzazioni">
                <Eye className="h-3.5 w-3.5" />
                <span className="font-medium">{question.views}</span>
              </span>
              <span className="flex items-center gap-0.5" title={question.aiAnswer ? "Con risposta IA" : "Senza risposta IA"}>
                {question.aiAnswer ? (
                  <>
                    <Bot className="h-3.5 w-3.5 text-green-600" />
                    <Check className="h-3 w-3 text-green-600" />
                  </>
                ) : (
                  <>
                    <Bot className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <X className="h-3 w-3 text-muted-foreground/60" />
                  </>
                )}
              </span>
              <span className="flex items-center gap-1" title="Commenti">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-medium">{question._count.comments}</span>
              </span>
              <span className="font-medium" title="Volte richiesta">x{question.timesAsked}</span>
            </div>
          </button>
        ))}
    </div>
  );
}
