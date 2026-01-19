"use client";

import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api/fetcher";
import type { University, Channel } from "@/lib/types/api.types";

// Query keys
export const universityKeys = {
  all: ["universities"] as const,
  lists: () => [...universityKeys.all, "list"] as const,
  detail: (id: string) => [...universityKeys.all, "detail", id] as const,
  channels: (universityId: string) => [...universityKeys.all, universityId, "channels"] as const,
};

// Hooks
export function useUniversities() {
  return useQuery({
    queryKey: universityKeys.lists(),
    queryFn: () => API.universities.list() as Promise<University[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes - universities rarely change
  });
}

export function useUniversityChannels(universityId: string) {
  return useQuery({
    queryKey: universityKeys.channels(universityId),
    queryFn: () => API.universities.channels(universityId) as Promise<Channel[]>,
    enabled: !!universityId,
    staleTime: 5 * 60 * 1000,
  });
}
