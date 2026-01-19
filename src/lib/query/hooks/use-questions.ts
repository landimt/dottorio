"use client";

import { useQuery } from "@tanstack/react-query";
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
};

// Hooks
export function useQuestions(params: Record<string, string | undefined>) {
  return useQuery({
    queryKey: questionKeys.list(params),
    queryFn: () => API.questions.search(params) as Promise<QuestionsSearchResponse>,
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: () => API.questions.get(id) as Promise<QuestionDetail>,
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
