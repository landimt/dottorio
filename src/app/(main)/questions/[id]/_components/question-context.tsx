"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface QuestionContextValue {
  questionId: string;
  navigateToQuestion: (id: string) => void;
}

const QuestionContext = createContext<QuestionContextValue | null>(null);

interface QuestionProviderProps {
  initialQuestionId: string;
  children: ReactNode;
}

/**
 * QuestionProvider - Manages SPA navigation between questions
 *
 * This context enables instant question switching without page reloads by:
 * 1. Managing the active questionId in local state
 * 2. Updating the URL without triggering a full page refresh
 * 3. Syncing with browser back/forward navigation
 */
export function QuestionProvider({ initialQuestionId, children }: QuestionProviderProps) {
  const router = useRouter();
  const [questionId, setQuestionId] = useState(initialQuestionId);

  /**
   * Navigate to a new question - Updates state immediately for instant UI update,
   * then updates URL in the background without page reload
   */
  const navigateToQuestion = useCallback(
    (id: string) => {
      if (id === questionId) return; // No-op if same question

      setQuestionId(id); // Immediate state update (SPA behavior)
      router.replace(`/questions/${id}`, { scroll: false }); // Update URL without reload
    },
    [questionId, router]
  );

  /**
   * Sync with URL changes (e.g., browser back/forward buttons)
   * This ensures the local state stays in sync when users use browser navigation
   */
  useEffect(() => {
    if (initialQuestionId !== questionId) {
      setQuestionId(initialQuestionId);
    }
  }, [initialQuestionId, questionId]);

  return (
    <QuestionContext.Provider value={{ questionId, navigateToQuestion }}>
      {children}
    </QuestionContext.Provider>
  );
}

/**
 * Hook to access question navigation context
 * @throws Error if used outside QuestionProvider
 */
export function useQuestionNavigation() {
  const context = useContext(QuestionContext);

  if (!context) {
    throw new Error("useQuestionNavigation must be used within QuestionProvider");
  }

  return context;
}
