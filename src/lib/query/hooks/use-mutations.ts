"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api/fetcher";
import { questionKeys } from "./use-questions";

/**
 * Mutation hooks for user interactions
 */

// Toggle save question
export function useSaveQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => API.questions.save(questionId),
    onSuccess: (_, questionId) => {
      // Invalidate question detail and saved list
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
      queryClient.invalidateQueries({ queryKey: questionKeys.saved() });
    },
  });
}

// Create student answer
export function useCreateAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      content,
      isPublic,
    }: {
      questionId: string;
      content: string;
      isPublic: boolean;
    }) => API.answers.create(questionId, content, isPublic),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
    },
  });
}

// Toggle like on answer
export function useLikeAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ answerId }: { answerId: string; questionId: string }) =>
      API.answers.like(answerId),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
    },
  });
}

// Create comment
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      content,
    }: {
      questionId: string;
      content: string;
    }) => API.comments.create(questionId, content),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
    },
  });
}

// Toggle like on comment
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; questionId: string }) =>
      API.comments.like(commentId),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
    },
  });
}

// Rate AI answer
export function useRateAiAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      aiAnswerId,
      rating,
    }: {
      aiAnswerId: string;
      rating: number;
      questionId: string;
    }) => API.aiAnswers.rate(aiAnswerId, rating),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
    },
  });
}

// Increment view count
export function useRecordView() {
  return useMutation({
    mutationFn: (questionId: string) => API.questions.view(questionId),
  });
}
