"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { QuestionDetail } from "./_components/question-detail";
import { useQuestion, useRelatedQuestionsInfinite, useQuestionVariations, usePersonalAnswer } from "@/lib/query/hooks/use-questions";
import { API } from "@/lib/api/fetcher";
import { Card } from "@/components/ui/card";
import QuestionDetailLoading from "./loading";

export default function QuestionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch all data with React Query
  const {
    data: question,
    isLoading: isLoadingQuestion,
    error: questionError,
  } = useQuestion(id);

  const {
    data: relatedQuestionsData,
    isLoading: isLoadingRelated,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRelatedQuestionsInfinite(id, !!question);

  // Flatten pages into single array
  const relatedQuestions = useMemo(() => {
    if (!relatedQuestionsData) return [];
    return relatedQuestionsData.pages.flatMap((page) => page.questions);
  }, [relatedQuestionsData]);

  const {
    data: variations = [],
    isLoading: isLoadingVariations,
  } = useQuestionVariations(id, !!question);

  const {
    data: personalAnswer,
    isLoading: isLoadingPersonalAnswer,
  } = usePersonalAnswer(id, !!userId);

  // Increment view count on mount (only once per question)
  useEffect(() => {
    if (id) {
      API.questions.view(id).catch((err) => {
        console.error("Failed to increment view count:", err);
      });
    }
  }, [id]);

  // Show error state
  if (questionError || (!question && !isLoadingQuestion)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-semibold mb-2">Domanda non trovata</h2>
          <p className="text-muted-foreground">
            La domanda che stai cercando non esiste o è stata rimossa.
          </p>
        </Card>
      </div>
    );
  }

  const isLoading = isLoadingQuestion || isLoadingRelated || isLoadingVariations || isLoadingPersonalAnswer;

  // Show loading state while any data is being fetched
  if (isLoading || !question) {
    return <QuestionDetailLoading />;
  }

  return (
    <QuestionDetail
      question={{
        ...(question as any),
        personalAnswer: personalAnswer as any,
      }}
      relatedQuestions={relatedQuestions as any}
      variations={variations as any}
      userId={userId}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
