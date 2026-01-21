"use client";

import { useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useQuestion,
  useRelatedQuestionsInfinite,
  useQuestionVariations,
  usePersonalAnswer,
  questionKeys,
} from "@/lib/query/hooks/use-questions";
import { API } from "@/lib/api/fetcher";
import { Card } from "@/components/ui/card";
import QuestionDetailLoading from "../loading";
import { QuestionDetail } from "./question-detail";

/**
 * QuestionDetailContainer - Data fetching layer for QuestionDetail
 *
 * Responsibilities:
 * - Fetch question data using React Query hooks
 * - Implement prefetching on hover for instant navigation
 * - Handle loading and error states
 * - Track view counts
 * - Pass clean props to presentation layer (QuestionDetail)
 */
interface QuestionDetailContainerProps {
  questionId: string;
}

export function QuestionDetailContainer({ questionId }: QuestionDetailContainerProps) {
  const router = useRouter();
  const routerRef = useRef(router);

  // Keep router ref up to date
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);

  // Keep queryClient ref up to date
  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);

  const userId = session?.user?.id;

  // Normalize questionId to prevent undefined/null issues
  const safeQuestionId = questionId || "";
  const isValidQuestionId = !!questionId && questionId !== "placeholder";

  // Navigation handler using Next.js router
  // scroll: false prevents losing scroll position in sidebar
  // Use routerRef to avoid recreating callback when router changes
  const navigateToQuestion = useCallback((id: string) => {
    routerRef.current.push(`/questions/${id}`, { scroll: false });
  }, []); // Empty dependency array - stable callback

  // Fetch question data
  const {
    data: question,
    isLoading: isLoadingQuestion,
    error: questionError,
  } = useQuestion(safeQuestionId);

  // Get subjectId from question to use as cache key
  // This ensures all questions from same subject share the same related questions list
  const subjectId = question?.exam?.subject?.id;

  console.log('[CACHE DEBUG] Question:', safeQuestionId);
  console.log('[CACHE DEBUG] SubjectId:', subjectId);
  console.log('[CACHE DEBUG] shouldFetch:', isValidQuestionId && !!subjectId);

  // Only fetch related questions once per subject (not per question)
  // This prevents refetching the list every time user navigates between questions
  const shouldFetchRelated = isValidQuestionId && !!subjectId;

  // Fetch related questions using first questionId but cache by subjectId
  // All questions in same subject will share this cached list
  const { data: relatedQuestionsData, isFetching, isLoading } = useRelatedQuestionsInfinite(
    safeQuestionId,
    shouldFetchRelated,
    50,
    subjectId // Pass subjectId to use as part of cache key
  );

  console.log('[CACHE DEBUG] isFetching:', isFetching, 'isLoading:', isLoading);
  console.log('[CACHE DEBUG] has data:', !!relatedQuestionsData);

  // Extract questions from response and filter out current question
  const relatedQuestions = useMemo(() => {
    if (!relatedQuestionsData || !relatedQuestionsData.questions) return [];
    // Filter out the current question to avoid duplicates (API sometimes returns it)
    return relatedQuestionsData.questions.filter((q: any) => q.id !== safeQuestionId);
  }, [relatedQuestionsData, safeQuestionId]);

  // Fetch variations
  const { data: variations = [] } = useQuestionVariations(safeQuestionId, shouldFetchRelated);

  // Fetch personal answer
  const { data: personalAnswer } = usePersonalAnswer(safeQuestionId, !!userId);

  /**
   * Prefetch question data on hover for instant navigation
   * This makes question switching feel instantaneous (<100ms)
   * Use queryClientRef to avoid recreating callback
   */
  const handlePrefetch = useCallback((id: string) => {
    const client = queryClientRef.current;

    // Prefetch main question data
    client.prefetchQuery({
      queryKey: questionKeys.detail(id),
      queryFn: () => API.questions.get(id),
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Prefetch related questions (limit 50 to match main query)
    client.prefetchQuery({
      queryKey: [...questionKeys.related(id), 50],
      queryFn: () => API.questions.related(id, { page: "1", limit: "50" }),
      staleTime: 1000 * 60 * 5,
    });
  }, []); // Empty dependency array - stable callback

  /**
   * Track view count when question loads
   * Only runs once per question (useEffect dependency on safeQuestionId)
   * Use ref to prevent double-counting in React Strict Mode
   */
  const viewTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isValidQuestionId && viewTrackedRef.current !== safeQuestionId) {
      viewTrackedRef.current = safeQuestionId;
      API.questions.view(safeQuestionId).catch((err) => {
        console.error("Failed to increment view count:", err);
      });
    }
  }, [safeQuestionId, isValidQuestionId]);

  // Early return after all hooks (respects Rules of Hooks)
  if (!isValidQuestionId) {
    return <QuestionDetailLoading />;
  }

  // Error state
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

  // Loading state - wait for question AND subjectId to be available
  if (isLoadingQuestion || !question || !question.exam?.subject?.id) {
    return <QuestionDetailLoading />;
  }

  return (
    <QuestionDetail
      question={question as any}
      relatedQuestions={relatedQuestions as any}
      variations={variations as any}
      userId={userId}
      onNavigate={navigateToQuestion}
      onQuestionHover={handlePrefetch}
    />
  );
}
