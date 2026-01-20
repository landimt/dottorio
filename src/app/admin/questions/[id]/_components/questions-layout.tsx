"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { QuestionsFilters, QuestionFilters } from "./questions-filters";
import { QuestionsList } from "./questions-list";
import { QuestionDetailsAdmin } from "./question-details-admin";

interface QuestionsLayoutProps {
  initialQuestionId: string;
  questions: any[];
  selectedQuestion: any;
  universities: { id: string; name: string }[];
  courses: { id: string; name: string; universityId: string }[];
  subjects: { id: string; name: string }[];
  professors: { id: string; name: string }[];
}

export function QuestionsLayout({
  initialQuestionId,
  questions,
  selectedQuestion,
  universities,
  courses,
  subjects,
  professors,
}: QuestionsLayoutProps) {
  const router = useRouter();
  const t = useTranslations("admin.questionDetail");
  const [filters, setFilters] = useState<QuestionFilters>({
    search: "",
    universityId: "all",
    courseId: "all",
    subjectId: "all",
    professorId: "all",
    year: "all",
    hasAiAnswer: "all",
    status: "active",
    sortBy: "recent",
  });

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Filter by search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((q) =>
        q.text.toLowerCase().includes(searchLower)
      );
    }

    // Filter by university
    if (filters.universityId !== "all") {
      result = result.filter((q) => q.exam.universityId === filters.universityId);
    }

    // Filter by course
    if (filters.courseId !== "all") {
      result = result.filter((q) => q.exam.courseId === filters.courseId);
    }

    // Filter by subject
    if (filters.subjectId !== "all") {
      result = result.filter((q) => q.exam.subjectId === filters.subjectId);
    }

    // Filter by professor
    if (filters.professorId !== "all") {
      result = result.filter((q) => q.exam.professorId === filters.professorId);
    }

    // Filter by year
    if (filters.year !== "all") {
      result = result.filter((q) => q.exam.year === parseInt(filters.year));
    }

    // Filter by AI answer
    if (filters.hasAiAnswer === "with") {
      result = result.filter((q) => q.aiAnswer);
    } else if (filters.hasAiAnswer === "without") {
      result = result.filter((q) => !q.aiAnswer);
    }

    // Sort
    switch (filters.sortBy) {
      case "recent":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "views":
        result.sort((a, b) => b.views - a.views);
        break;
      case "saved":
        result.sort((a, b) => b._count.savedBy - a._count.savedBy);
        break;
      case "timesAsked":
        result.sort((a, b) => b.timesAsked - a.timesAsked);
        break;
      case "alphabetical":
        result.sort((a, b) => a.text.localeCompare(b.text));
        break;
    }

    return result;
  }, [questions, filters]);

  const handleSelectQuestion = (questionId: string) => {
    router.push(`/admin/questions/${questionId}`);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] rounded-lg overflow-hidden border">
      {/* Left Sidebar - 20% */}
      <div className="w-[20%] flex flex-col border-r bg-muted/10 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Filters Section */}
          <div className="p-4 border-b bg-background/50">
            <QuestionsFilters
              universities={universities}
              courses={courses}
              subjects={subjects}
              professors={professors}
              onFilterChange={setFilters}
            />
          </div>

          {/* Results Count */}
          <div className="px-4 py-2 bg-muted/30 border-b">
            <p className="text-xs text-muted-foreground font-medium">
              {t("resultsCount", { count: filteredQuestions.length })}
            </p>
          </div>

          {/* Questions List */}
          <div className="p-3">
            <QuestionsList
              questions={filteredQuestions}
              selectedQuestionId={initialQuestionId}
              onSelectQuestion={handleSelectQuestion}
            />
          </div>
        </div>
      </div>

      {/* Right Content - 80% */}
      <div className="w-[80%] overflow-y-auto bg-background">
        <QuestionDetailsAdmin question={selectedQuestion} />
      </div>
    </div>
  );
}
