"use client";

import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api/fetcher";
import type { Subject } from "@/lib/types/api.types";

// Query keys
export const subjectKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectKeys.all, "list"] as const,
  detail: (id: string) => [...subjectKeys.all, "detail", id] as const,
};

// Hooks
export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.lists(),
    queryFn: () => API.subjects.list() as Promise<Subject[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes - subjects rarely change
  });
}
