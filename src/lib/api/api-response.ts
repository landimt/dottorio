import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Re-export API fetcher for client-side usage
export { API, ApiError } from "./fetcher";

/**
 * Standard API response types
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * HTTP status code to error code mapping
 */
const STATUS_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  500: "INTERNAL_ERROR",
};

/**
 * Create a success response
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Create an error response
 */
export function apiError(
  message: string,
  status = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: code || STATUS_CODES[status] || "UNKNOWN_ERROR",
        ...(details !== undefined && { details }),
      },
    },
    { status }
  );
}

/**
 * Handle Zod validation errors
 */
export function apiValidationError(error: ZodError): NextResponse<ApiErrorResponse> {
  const firstIssue = error.issues[0];
  return apiError(
    firstIssue?.message || "Dati non validi",
    422,
    "VALIDATION_ERROR",
    error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }))
  );
}

/**
 * Handle unknown errors safely
 */
export function apiUnknownError(error: unknown, fallbackMessage = "Errore interno del server"): NextResponse<ApiErrorResponse> {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return apiValidationError(error);
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return apiError(message, 500);
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: () => apiError("Autenticazione richiesta", 401),
  forbidden: () => apiError("Accesso negato", 403),
  notFound: (resource = "Risorsa") => apiError(`${resource} non trovato`, 404),
  badRequest: (message = "Richiesta non valida") => apiError(message, 400),
} as const;
