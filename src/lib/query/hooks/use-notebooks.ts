"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api/fetcher";
import type { ProseMirrorDoc } from "@/lib/validations/notebook.schema";

// ============================================
// TYPES
// ============================================

export interface NotebookPage {
  id: string;
  notebookId: string;
  title: string;
  content: ProseMirrorDoc | null; // Changed from string to ProseMirror JSON
  contentHtml: string | null; // HTML cache for rendering
  order: number;
  version: number;
  wordCount: number;
  characterCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Notebook {
  id: string;
  title: string;
  subject: string | null;
  icon: string;
  color: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  pages: NotebookPage[];
  _count?: {
    pages: number;
  };
}

export interface NotebooksListResponse {
  notebooks: Notebook[];
  total: number;
  hasMore: boolean;
}

// Input types for mutations
export interface CreateNotebookInput {
  title: string;
  subject?: string | null;
  icon?: string;
  color?: string | null;
}

export interface UpdateNotebookInput {
  title?: string;
  subject?: string | null;
  icon?: string;
  color?: string | null;
}

export interface CreatePageInput {
  title: string;
  content?: ProseMirrorDoc | null;
  contentHtml?: string | null;
  order?: number;
  wordCount?: number;
  characterCount?: number;
}

export interface UpdatePageInput {
  title?: string;
  content?: ProseMirrorDoc | null;
  contentHtml?: string | null;
  order?: number;
  wordCount?: number;
  characterCount?: number;
  version?: number; // For optimistic locking
}

// ============================================
// QUERY KEYS
// ============================================

export const notebookKeys = {
  all: ["notebooks"] as const,
  lists: () => [...notebookKeys.all, "list"] as const,
  details: () => [...notebookKeys.all, "detail"] as const,
  detail: (id: string) => [...notebookKeys.details(), id] as const,
  pages: () => [...notebookKeys.all, "pages"] as const,
  page: (pageId: string) => [...notebookKeys.pages(), pageId] as const,
};

// ============================================
// QUERY OPTIONS
// ============================================

const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const GC_TIME = 1000 * 60 * 30; // 30 minutes

// ============================================
// HOOKS - QUERIES
// ============================================

/**
 * Fetch all notebooks for the current user
 */
export function useNotebooks() {
  return useQuery({
    queryKey: notebookKeys.lists(),
    queryFn: async () => {
      const response = await API.notebooks.list();
      // Handle both old format (array) and new format (object with notebooks)
      if (Array.isArray(response)) {
        return response as Notebook[];
      }
      return (response as NotebooksListResponse).notebooks;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Fetch a single notebook by ID
 */
export function useNotebook(id: string) {
  return useQuery({
    queryKey: notebookKeys.detail(id),
    queryFn: () => API.notebooks.get(id) as Promise<Notebook>,
    enabled: !!id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

// ============================================
// HOOKS - MUTATIONS
// ============================================

/**
 * Create a new notebook
 */
export function useCreateNotebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotebookInput) =>
      API.notebooks.create(data) as Promise<Notebook>,
    onSuccess: (newNotebook) => {
      // Optimistic update: add to list immediately
      queryClient.setQueryData<Notebook[]>(notebookKeys.lists(), (old) => {
        if (!old) return [newNotebook];
        return [newNotebook, ...old];
      });
      // Also set the detail cache
      queryClient.setQueryData(notebookKeys.detail(newNotebook.id), newNotebook);
    },
    onError: (error) => {
      console.error("Failed to create notebook:", error);
    },
  });
}

/**
 * Update a notebook
 */
export function useUpdateNotebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotebookInput }) =>
      API.notebooks.update(id, data) as Promise<Notebook>,
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notebookKeys.detail(id) });

      // Snapshot the previous value
      const previousNotebook = queryClient.getQueryData<Notebook>(
        notebookKeys.detail(id)
      );

      // Optimistically update
      if (previousNotebook) {
        queryClient.setQueryData<Notebook>(notebookKeys.detail(id), {
          ...previousNotebook,
          ...data,
        });
      }

      return { previousNotebook };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousNotebook) {
        queryClient.setQueryData(notebookKeys.detail(id), context.previousNotebook);
      }
      console.error("Failed to update notebook:", error);
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: notebookKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: notebookKeys.lists() });
    },
  });
}

/**
 * Delete (soft) a notebook
 */
export function useDeleteNotebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => API.notebooks.delete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notebookKeys.lists() });

      // Snapshot the previous value
      const previousNotebooks = queryClient.getQueryData<Notebook[]>(
        notebookKeys.lists()
      );

      // Optimistically remove from list
      queryClient.setQueryData<Notebook[]>(notebookKeys.lists(), (old) => {
        if (!old) return [];
        return old.filter((nb) => nb.id !== id);
      });

      return { previousNotebooks };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousNotebooks) {
        queryClient.setQueryData(notebookKeys.lists(), context.previousNotebooks);
      }
      console.error("Failed to delete notebook:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notebookKeys.lists() });
    },
  });
}

// ============================================
// PAGE MUTATIONS
// ============================================

/**
 * Create a new page in a notebook
 */
export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notebookId,
      data,
    }: {
      notebookId: string;
      data: CreatePageInput;
    }) => API.notebooks.createPage(notebookId, data) as Promise<NotebookPage>,
    onSuccess: (newPage, { notebookId }) => {
      // Optimistic update: add page to notebook
      queryClient.setQueryData<Notebook>(
        notebookKeys.detail(notebookId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: [...old.pages, newPage].sort((a, b) => a.order - b.order),
            _count: old._count ? { pages: old._count.pages + 1 } : undefined,
          };
        }
      );
    },
    onError: (error) => {
      console.error("Failed to create page:", error);
    },
    onSettled: (_, __, { notebookId }) => {
      queryClient.invalidateQueries({ queryKey: notebookKeys.detail(notebookId) });
      queryClient.invalidateQueries({ queryKey: notebookKeys.lists() });
    },
  });
}

/**
 * Update a page with optimistic locking support
 */
export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pageId,
      notebookId,
      data,
    }: {
      pageId: string;
      notebookId: string;
      data: UpdatePageInput;
    }) => API.notebooks.updatePage(pageId, data) as Promise<NotebookPage>,
    onMutate: async ({ pageId, notebookId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notebookKeys.detail(notebookId) });

      // Snapshot the previous value
      const previousNotebook = queryClient.getQueryData<Notebook>(
        notebookKeys.detail(notebookId)
      );

      // Optimistically update
      if (previousNotebook) {
        queryClient.setQueryData<Notebook>(notebookKeys.detail(notebookId), {
          ...previousNotebook,
          pages: previousNotebook.pages.map((page) =>
            page.id === pageId ? { ...page, ...data } : page
          ),
        });
      }

      return { previousNotebook };
    },
    onError: (error, { notebookId }, context) => {
      // Rollback on error
      if (context?.previousNotebook) {
        queryClient.setQueryData(
          notebookKeys.detail(notebookId),
          context.previousNotebook
        );
      }
      console.error("Failed to update page:", error);
    },
    // Don't invalidate on success to avoid refetch during typing
    // The optimistic update is sufficient
  });
}

/**
 * Delete (soft) a page
 */
export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId }: { pageId: string; notebookId: string }) =>
      API.notebooks.deletePage(pageId),
    onMutate: async ({ pageId, notebookId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notebookKeys.detail(notebookId) });

      // Snapshot the previous value
      const previousNotebook = queryClient.getQueryData<Notebook>(
        notebookKeys.detail(notebookId)
      );

      // Optimistically remove from list
      if (previousNotebook) {
        queryClient.setQueryData<Notebook>(notebookKeys.detail(notebookId), {
          ...previousNotebook,
          pages: previousNotebook.pages.filter((page) => page.id !== pageId),
          _count: previousNotebook._count
            ? { pages: previousNotebook._count.pages - 1 }
            : undefined,
        });
      }

      return { previousNotebook };
    },
    onError: (error, { notebookId }, context) => {
      // Rollback on error
      if (context?.previousNotebook) {
        queryClient.setQueryData(
          notebookKeys.detail(notebookId),
          context.previousNotebook
        );
      }
      console.error("Failed to delete page:", error);
    },
    onSettled: (_, __, { notebookId }) => {
      queryClient.invalidateQueries({ queryKey: notebookKeys.detail(notebookId) });
      queryClient.invalidateQueries({ queryKey: notebookKeys.lists() });
    },
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Prefetch a notebook for faster navigation
 */
export function usePrefetchNotebook() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: notebookKeys.detail(id),
      queryFn: () => API.notebooks.get(id) as Promise<Notebook>,
      staleTime: STALE_TIME,
    });
  };
}
