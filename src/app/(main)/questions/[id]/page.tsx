"use client";

import { useParams } from "next/navigation";
import { QuestionDetailContainer } from "./_components/question-detail-container";

/**
 * QuestionDetailPage - Entry point for question detail page
 */
export default function QuestionDetailPage() {
  const params = useParams();
  const questionId = params.id as string;

  return <QuestionDetailContainer questionId={questionId} />;
}
