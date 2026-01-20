/**
 * Centralized API fetcher for consistent request/response handling
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Parse API response - handles both old format (direct data) and new format ({ success, data })
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  // Handle new standardized format
  if (typeof data === "object" && "success" in data) {
    if (data.success) {
      return data.data as T;
    } else {
      throw new ApiError(
        data.error?.message || "Errore sconosciuto",
        response.status,
        data.error?.code
      );
    }
  }

  // Handle old format (direct data) or error
  if (!response.ok) {
    throw new ApiError(
      data.error || "Errore nella richiesta",
      response.status
    );
  }

  return data as T;
}

/**
 * Base fetcher with common configuration
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  return parseResponse<T>(response);
}

/**
 * GET request
 */
export async function apiGet<T>(
  url: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });
  }
  const queryString = searchParams.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  return apiFetch<T>(fullUrl);
}

/**
 * POST request
 */
export async function apiPost<T, B = unknown>(
  url: string,
  body?: B
): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T, B = unknown>(
  url: string,
  body: B
): Promise<T> {
  return apiFetch<T>(url, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, {
    method: "DELETE",
  });
}

/**
 * API endpoints
 */
export const API = {
  // Questions
  questions: {
    search: (params: Record<string, string | undefined>) =>
      apiGet<{ questions: unknown[]; pagination: unknown }>("/api/questions", params),
    get: (id: string) =>
      apiGet<unknown>(`/api/questions/${id}`),
    save: (id: string) =>
      apiPost<{ saved: boolean }>(`/api/questions/${id}/save`),
    view: (id: string) =>
      apiPost<void>(`/api/questions/${id}/view`),
    similar: (text: string, excludeId?: string) =>
      apiGet<{ questions: unknown[] }>("/api/questions/similar", { text, excludeId }),
    saved: (params?: { page?: string; limit?: string }) =>
      apiGet<{ questions: unknown[]; pagination: unknown }>("/api/questions/saved", params),
  },

  // Answers
  answers: {
    create: (questionId: string, content: string, isPublic: boolean) =>
      apiPost<unknown>(`/api/questions/${questionId}/answer`, { content, isPublic }),
    like: (id: string) =>
      apiPost<{ liked: boolean }>(`/api/answers/${id}/like`),
  },

  // Comments
  comments: {
    create: (questionId: string, content: string) =>
      apiPost<unknown>(`/api/questions/${questionId}/comments`, { content }),
    like: (id: string) =>
      apiPost<{ liked: boolean }>(`/api/comments/${id}/like`),
  },

  // AI Answers
  aiAnswers: {
    rate: (id: string, rating: number) =>
      apiPost<void>(`/api/ai-answers/${id}/rate`, { rating }),
  },

  // Exams
  exams: {
    list: () => apiGet<unknown[]>("/api/exams"),
    get: (id: string) => apiGet<unknown>(`/api/exams/${id}`),
    create: (data: unknown) => apiPost<unknown>("/api/exams", data),
    questions: (id: string) => apiGet<unknown[]>(`/api/exams/${id}/questions`),
  },

  // Reference data
  universities: {
    list: () => apiGet<unknown[]>("/api/universities"),
    courses: (id: string) => apiGet<unknown[]>(`/api/universities/${id}/courses`),
  },
  subjects: {
    list: () => apiGet<unknown[]>("/api/subjects"),
  },
  professors: {
    list: (subjectId?: string) =>
      apiGet<unknown[]>("/api/professors", subjectId ? { subjectId } : undefined),
  },

  // Admin
  admin: {
    universities: {
      list: () => apiGet<unknown[]>("/api/admin/universities"),
      get: (id: string) => apiGet<unknown>(`/api/admin/universities/${id}`),
      create: (data: unknown) => apiPost<unknown>("/api/admin/universities", data),
      update: (id: string, data: unknown) => apiPut<unknown>(`/api/admin/universities/${id}`, data),
      delete: (id: string) => apiDelete<void>(`/api/admin/universities/${id}`),
    },
    courses: {
      list: (universityId?: string) => apiGet<unknown[]>("/api/admin/courses", universityId ? { universityId } : undefined),
      get: (id: string) => apiGet<unknown>(`/api/admin/courses/${id}`),
      create: (data: unknown) => apiPost<unknown>("/api/admin/courses", data),
      update: (id: string, data: unknown) => apiPut<unknown>(`/api/admin/courses/${id}`, data),
      delete: (id: string) => apiDelete<void>(`/api/admin/courses/${id}`),
    },
    subjects: {
      list: () => apiGet<unknown[]>("/api/admin/subjects"),
      get: (id: string) => apiGet<unknown>(`/api/admin/subjects/${id}`),
      create: (data: unknown) => apiPost<unknown>("/api/admin/subjects", data),
      update: (id: string, data: unknown) => apiPut<unknown>(`/api/admin/subjects/${id}`, data),
      delete: (id: string) => apiDelete<void>(`/api/admin/subjects/${id}`),
      // Professor associations
      associateProfessors: (subjectId: string, professorIds: string[]) =>
        apiPost<unknown>(`/api/admin/subjects/${subjectId}/professors`, { professorIds }),
      disassociateProfessor: (subjectId: string, professorSubjectId: string) =>
        apiDelete<void>(`/api/admin/subjects/${subjectId}/professors/${professorSubjectId}`),
    },
    professors: {
      list: () => apiGet<unknown[]>("/api/admin/professors"),
      get: (id: string) => apiGet<unknown>(`/api/admin/professors/${id}`),
      create: (data: unknown) => apiPost<unknown>("/api/admin/professors", data),
      update: (id: string, data: unknown) => apiPut<unknown>(`/api/admin/professors/${id}`, data),
      delete: (id: string) => apiDelete<void>(`/api/admin/professors/${id}`),
    },
    users: {
      get: (id: string) => apiGet<unknown>(`/api/admin/users/${id}`),
      update: (id: string, data: unknown) => apiPut<unknown>(`/api/admin/users/${id}`, data),
    },
    questions: {
      delete: (id: string) => apiDelete<void>(`/api/admin/questions/${id}`),
    },
  },
} as const;
