"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, RotateCcw, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface QuestionsFiltersProps {
  universities: { id: string; name: string }[];
  courses: { id: string; name: string; universityId: string }[];
  subjects: { id: string; name: string }[];
  professors: { id: string; name: string }[];
  onFilterChange: (filters: QuestionFilters) => void;
}

export interface QuestionFilters {
  search: string;
  universityId: string;
  courseId: string;
  subjectId: string;
  professorId: string;
  year: string;
  hasAiAnswer: "all" | "with" | "without";
  status: "active" | "hidden" | "deleted" | "all";
  sortBy: "recent" | "views" | "saved" | "alphabetical" | "timesAsked";
}

export function QuestionsFilters({
  universities,
  courses,
  subjects,
  professors,
  onFilterChange,
}: QuestionsFiltersProps) {
  const t = useTranslations("admin.questionDetail.filters");
  const tCommon = useTranslations("common");

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

  const handleFilterChange = (key: keyof QuestionFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: QuestionFilters = {
      search: "",
      universityId: "all",
      courseId: "all",
      subjectId: "all",
      professorId: "all",
      year: "all",
      hasAiAnswer: "all",
      status: "active",
      sortBy: "recent",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Filter courses based on selected university
  const filteredCourses = filters.universityId === "all"
    ? courses
    : courses.filter(c => c.universityId === filters.universityId);

  // Get display values for selects
  const getUniversityLabel = () => {
    if (filters.universityId === "all") return t("allUniversities");
    const uni = universities.find(u => u.id === filters.universityId);
    return uni?.name || t("allUniversities");
  };

  const getCourseLabel = () => {
    if (filters.courseId === "all") return t("allCourses");
    const course = courses.find(c => c.id === filters.courseId);
    return course?.name || t("allCourses");
  };

  const getSubjectLabel = () => {
    if (filters.subjectId === "all") return t("allSubjects");
    const subject = subjects.find(s => s.id === filters.subjectId);
    return subject?.name || t("allSubjects");
  };

  const getProfessorLabel = () => {
    if (filters.professorId === "all") return t("allProfessors");
    const prof = professors.find(p => p.id === filters.professorId);
    return prof?.name || t("allProfessors");
  };

  const getYearLabel = () => {
    if (filters.year === "all") return t("allYears");
    return `${filters.year}º Anno`;
  };

  const getSortLabel = () => {
    const labels: Record<QuestionFilters["sortBy"], string> = {
      recent: t("mostRecent"),
      views: t("mostViewed"),
      saved: t("mostSaved"),
      timesAsked: t("mostAsked"),
      alphabetical: t("alphabetical"),
    };
    return labels[filters.sortBy];
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Search className="h-4 w-4" />
          {t("title")}
        </h3>
      </div>

      {/* Search Text */}
      <div className="space-y-1.5">
        <Label htmlFor="search" className="text-xs font-medium">{t("searchText")}</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder={t("searchPlaceholder")}
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* University */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("university")}</Label>
        <Select
          value={filters.universityId}
          onValueChange={(value) => handleFilterChange("universityId", value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {getUniversityLabel()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allUniversities")}</SelectItem>
            {universities.map((uni) => (
              <SelectItem key={uni.id} value={uni.id}>
                {uni.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("course")}</Label>
        <Select
          value={filters.courseId}
          onValueChange={(value) => handleFilterChange("courseId", value)}
          disabled={filters.universityId === "all"}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {getCourseLabel()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCourses")}</SelectItem>
            {filteredCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("subject")}</Label>
        <Select
          value={filters.subjectId}
          onValueChange={(value) => handleFilterChange("subjectId", value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {getSubjectLabel()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allSubjects")}</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Professor */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("professor")}</Label>
        <Select
          value={filters.professorId}
          onValueChange={(value) => handleFilterChange("professorId", value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {getProfessorLabel()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allProfessors")}</SelectItem>
            {professors.map((prof) => (
              <SelectItem key={prof.id} value={prof.id}>
                {prof.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("year")}</Label>
        <Select
          value={filters.year}
          onValueChange={(value) => handleFilterChange("year", value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {getYearLabel()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allYears")}</SelectItem>
            <SelectItem value="1">1º Anno</SelectItem>
            <SelectItem value="2">2º Anno</SelectItem>
            <SelectItem value="3">3º Anno</SelectItem>
            <SelectItem value="4">4º Anno</SelectItem>
            <SelectItem value="5">5º Anno</SelectItem>
            <SelectItem value="6">6º Anno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AI Answer */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("aiAnswer")}</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ai-all"
              checked={filters.hasAiAnswer === "all"}
              onCheckedChange={() => handleFilterChange("hasAiAnswer", "all")}
            />
            <label htmlFor="ai-all" className="text-xs cursor-pointer">
              {t("allQuestions")}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ai-with"
              checked={filters.hasAiAnswer === "with"}
              onCheckedChange={() => handleFilterChange("hasAiAnswer", "with")}
            />
            <label htmlFor="ai-with" className="text-xs cursor-pointer">
              {t("withAiAnswer")}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ai-without"
              checked={filters.hasAiAnswer === "without"}
              onCheckedChange={() => handleFilterChange("hasAiAnswer", "without")}
            />
            <label htmlFor="ai-without" className="text-xs cursor-pointer">
              {t("withoutAiAnswer")}
            </label>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("status")}</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="status-active"
              checked={filters.status === "active"}
              onCheckedChange={() => handleFilterChange("status", "active")}
            />
            <label htmlFor="status-active" className="text-xs cursor-pointer">
              {t("active")}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="status-all"
              checked={filters.status === "all"}
              onCheckedChange={() => handleFilterChange("status", "all")}
            />
            <label htmlFor="status-all" className="text-xs cursor-pointer">
              {t("all")}
            </label>
          </div>
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("sortBy")}</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => handleFilterChange("sortBy", value as QuestionFilters["sortBy"])}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {getSortLabel()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t("mostRecent")}</SelectItem>
            <SelectItem value="views">{t("mostViewed")}</SelectItem>
            <SelectItem value="saved">{t("mostSaved")}</SelectItem>
            <SelectItem value="timesAsked">{t("mostAsked")}</SelectItem>
            <SelectItem value="alphabetical">{t("alphabetical")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <div className="pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full text-xs h-8"
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}
