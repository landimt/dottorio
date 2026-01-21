"use client";

import { useMemo } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { API } from "@/lib/api/fetcher";
import type {
  QuestionsSearchResponse,
  QuestionDetail,
  SimilarQuestionsResponse,
} from "@/lib/types/api.types";

// Query keys - exported for use in mutations
export const questionKeys = {
  all: ["questions"] as const,
  lists: () => [...questionKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...questionKeys.lists(), filters] as const,
  details: () => [...questionKeys.all, "detail"] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
  similar: (text: string) => [...questionKeys.all, "similar", text] as const,
  saved: () => [...questionKeys.all, "saved"] as const,
  related: (id: string) => [...questionKeys.all, "related", id] as const,
  variations: (id: string) => [...questionKeys.all, "variations", id] as const,
  personalAnswer: (id: string) => [...questionKeys.all, "personal-answer", id] as const,
};

// Hooks
export function useQuestions(params: Record<string, string | undefined>) {
  return useQuery({
    queryKey: questionKeys.list(params),
    queryFn: () => API.questions.search(params) as Promise<QuestionsSearchResponse>,
  });
}

export function useQuestion(id: string) {
  const safeId = id || "placeholder";
  return useQuery({
    queryKey: questionKeys.detail(safeId),
    queryFn: () => API.questions.get(safeId) as Promise<QuestionDetail>,
    enabled: !!id,
  });
}

export function useSimilarQuestions(text: string, excludeId?: string) {
  return useQuery({
    queryKey: questionKeys.similar(text),
    queryFn: () => API.questions.similar(text, excludeId) as Promise<SimilarQuestionsResponse>,
    enabled: text.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSavedQuestions(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...questionKeys.saved(), { page, limit }],
    queryFn: () => API.questions.saved({ page: String(page), limit: String(limit) }),
  });
}

export function useRelatedQuestions(id: string, enabled = true) {
  const safeId = id || "placeholder";
  return useQuery({
    queryKey: questionKeys.related(safeId),
    queryFn: () => API.questions.related(safeId),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes - changes less frequently
  });
}

export function useRelatedQuestionsInfinite(id: string, enabled = true, limit = 50, subjectId?: string) {
  // Safety check: use a fallback id to prevent errors during transitions
  const safeId = id || "placeholder";
  // CRITICAL: Only enable if we have both id AND subjectId
  // Without subjectId, we can't create a proper cache key
  const isEnabled = enabled && !!id && !!subjectId;

  // Use subjectId as part of cache key so all questions from same subject
  // share the same cached related questions list
  // This prevents refetching every time user navigates between questions
  // If no subjectId, use a disabled placeholder key
  const cacheKey = subjectId
    ? ['questions', 'related-by-subject', subjectId, limit]
    : ['questions', 'related-disabled'];

  console.log('[useRelatedQuestionsInfinite] questionId:', safeId);
  console.log('[useRelatedQuestionsInfinite] subjectId:', subjectId);
  console.log('[useRelatedQuestionsInfinite] cacheKey:', JSON.stringify(cacheKey));
  console.log('[useRelatedQuestionsInfinite] enabled:', isEnabled);

  // Simplified: Use regular useQuery instead of useInfiniteQuery
  // This avoids the "Cannot read properties of undefined (reading 'length')" error
  // that occurs during SPA navigation transitions
  return useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      console.log('[useRelatedQuestionsInfinite] FETCHING from API for questionId:', safeId);
      try {
        const result = await API.questions.related(safeId, {
          page: "1",
          limit: String(limit)
        });

        // Ensure result has expected structure
        if (!result || typeof result !== 'object') {
          return { questions: [], pagination: { page: 1, hasMore: false } };
        }

        return result;
      } catch (error) {
        console.error('Error fetching related questions:', error);
        // Return empty result on error
        return { questions: [], pagination: { page: 1, hasMore: false } };
      }
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 10, // 10 minutes - cache for a long time
    gcTime: 1000 * 60 * 15, // Keep in cache for 15 minutes after component unmounts
    // Disabled placeholderData to prevent render loops
    // placeholderData: (previousData) => previousData,
  });
}

export function useQuestionVariations(id: string, enabled = true) {
  const safeId = id || "placeholder";
  return useQuery({
    queryKey: questionKeys.variations(safeId),
    queryFn: () => API.questions.variations(safeId),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes - changes less frequently
  });
}

export function usePersonalAnswer(id: string, enabled = true) {
  const safeId = id || "placeholder";
  return useQuery({
    queryKey: questionKeys.personalAnswer(safeId),
    queryFn: () => API.questions.personalAnswer(safeId),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false, // Don't retry if user doesn't have an answer yet
  });
}
