"use client";

import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api/fetcher";
import type { University, Course } from "@/lib/types/api.types";

// Query keys
export const universityKeys = {
  all: ["universities"] as const,
  lists: () => [...universityKeys.all, "list"] as const,
  detail: (id: string) => [...universityKeys.all, "detail", id] as const,
  courses: (universityId: string) => [...universityKeys.all, universityId, "courses"] as const,
};

// Hooks
export function useUniversities() {
  return useQuery({
    queryKey: universityKeys.lists(),
    queryFn: () => API.universities.list() as Promise<University[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes - universities rarely change
  });
}

export function useUniversityCourses(universityId: string) {
  return useQuery({
    queryKey: universityKeys.courses(universityId),
    queryFn: () => API.universities.courses(universityId) as Promise<Course[]>,
    enabled: !!universityId,
    staleTime: 5 * 60 * 1000,
  });
}
