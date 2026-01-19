"use client";

import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api/fetcher";
import type { Professor } from "@/lib/types/api.types";

// Query keys
export const professorKeys = {
  all: ["professors"] as const,
  lists: () => [...professorKeys.all, "list"] as const,
  bySubject: (subjectId: string) => [...professorKeys.all, "bySubject", subjectId] as const,
  detail: (id: string) => [...professorKeys.all, "detail", id] as const,
};

// Hooks
export function useProfessors(subjectId?: string) {
  return useQuery({
    queryKey: subjectId ? professorKeys.bySubject(subjectId) : professorKeys.lists(),
    queryFn: () => API.professors.list(subjectId) as Promise<Professor[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
