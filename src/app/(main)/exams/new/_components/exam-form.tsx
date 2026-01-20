"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, ArrowLeft, Plus, X, Link2, Copy, Search, GitBranch, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Subject {
  id: string;
  name: string;
}

interface Professor {
  id: string;
  name: string;
}

interface University {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  universityId: string;
}

interface CanonicalQuestion {
  id: string;
  text: string;
  groupId: string;
  variationsCount: number;
  subject: string;
  professor: string | null;
}

interface CreatedQuestion {
  id: string;
  text: string;
}

interface ExamFormProps {
  universities: University[];
  courses: Course[];
}

export function ExamForm({ universities, courses }: ExamFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const t = useTranslations("exam");
  const tCommon = useTranslations("common");
  const tQuestion = useTranslations("question");

  // Prefill data from URL params (shared links)
  const prefillData = {
    subject: searchParams.get("subject") || "",
    professor: searchParams.get("professor") || "",
    courseId: searchParams.get("courseId") || "",
  };

  const hasPrefill = prefillData.subject || prefillData.professor || prefillData.courseId;

  const [formData, setFormData] = useState({
    universityId: session?.user?.universityId || "",
    courseId: prefillData.courseId || session?.user?.courseId || "",
    year: session?.user?.year || 1, // Now a number (1-6)
    subjectId: prefillData.subject,
    professorId: prefillData.professor,
    questions: [""], // Array of questions
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareableLink, setShareableLink] = useState("");

  // Dynamic data loading
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(false);

  // Question Linking States
  const [createdQuestions, setCreatedQuestions] = useState<CreatedQuestion[]>([]);
  const [currentLinkingIndex, setCurrentLinkingIndex] = useState(0);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Manual search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CanonicalQuestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCanonical, setSelectedCanonical] = useState<CanonicalQuestion | null>(null);

  // Update form if prefillData changes
  useEffect(() => {
    if (hasPrefill) {
      setFormData((prev) => ({
        ...prev,
        courseId: prefillData.courseId || prev.courseId,
        subjectId: prefillData.subject || prev.subjectId,
        professorId: prefillData.professor || prev.professorId,
      }));
    }
  }, [hasPrefill, prefillData.courseId, prefillData.subject, prefillData.professor]);

  // Update university and course from session
  useEffect(() => {
    if (session?.user?.universityId) {
      setFormData((prev) => ({
        ...prev,
        universityId: session.user.universityId || "",
        courseId: prev.courseId || session.user.courseId || "",
        year: session.user.year || prev.year,
      }));
    }
  }, [session?.user?.universityId, session?.user?.courseId, session?.user?.year]);

  // Load subjects when course or year changes
  useEffect(() => {
    async function loadSubjects() {
      if (!formData.courseId) {
        setSubjects([]);
        return;
      }

      setIsLoadingSubjects(true);
      try {
        // Build URL with course and optional year filter
        const params = new URLSearchParams({ courseId: formData.courseId });
        if (formData.year) {
          params.append("year", String(formData.year));
        }
        const response = await fetch(`/api/subjects?${params.toString()}`);
        if (response.ok) {
          const result = await response.json();
          setSubjects(result.data || []);
        }
      } catch (error) {
        console.error("Error loading subjects:", error);
        setSubjects([]);
      } finally {
        setIsLoadingSubjects(false);
      }
    }

    loadSubjects();
    // Reset subject and professor when course or year changes (unless prefilled)
    if (!prefillData.subject) {
      setFormData((prev) => ({ ...prev, subjectId: "", professorId: "" }));
    }
  }, [formData.courseId, formData.year, prefillData.subject]);

  // Load professors when subject changes
  useEffect(() => {
    async function loadProfessors() {
      if (!formData.subjectId) {
        setProfessors([]);
        return;
      }

      setIsLoadingProfessors(true);
      try {
        const response = await fetch(`/api/professors?subjectId=${formData.subjectId}`);
        if (response.ok) {
          const result = await response.json();
          setProfessors(result.data || []);
        }
      } catch (error) {
        console.error("Error loading professors:", error);
        setProfessors([]);
      } finally {
        setIsLoadingProfessors(false);
      }
    }

    loadProfessors();
    // Reset professor when subject changes (unless prefilled)
    if (!prefillData.professor) {
      setFormData((prev) => ({ ...prev, professorId: "" }));
    }
  }, [formData.subjectId, prefillData.professor]);

  // Years as numbers (1-6)
  const years = [1, 2, 3, 4, 5, 6];

  // Filter courses by user's university
  const universityCourses = courses.filter(
    (ch) => ch.universityId === formData.universityId
  );

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add new question
  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ""],
    }));
  };

  // Remove specific question
  const handleRemoveQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }));
    }
  };

  // Update specific question text
  const handleQuestionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? value : q)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter empty questions
    const filledQuestions = formData.questions.filter((q) => q.trim());
    if (filledQuestions.length === 0) return;

    setIsSubmitting(true);

    try {
      // First, create or find an exam
      const examResponse = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: formData.subjectId,
          professorId: formData.professorId,
          universityId: formData.universityId,
          courseId: formData.courseId || undefined,
          year: formData.year || undefined,
        }),
      });

      if (!examResponse.ok) {
        throw new Error(t("creationError"));
      }

      const examResult = await examResponse.json();
      const exam = examResult.data;

      // Then, create all questions for this exam and capture the responses
      const questionResponses = await Promise.all(
        filledQuestions.map(async (text) => {
          const response = await fetch("/api/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId: exam.id,
              text,
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || t("questionCreationError"));
          }
          const questionResult = await response.json();
          return { id: questionResult.data.id, text };
        })
      );

      // Store created questions for potential linking
      setCreatedQuestions(questionResponses);

      // Show linking modal for all questions (manual search)
      if (questionResponses.length > 0) {
        setCurrentLinkingIndex(0);
        setSearchQuery("");
        setSearchResults([]);
        setSelectedCanonical(null);
        setShowLinkModal(true);
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch {
      toast.error(t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search canonical questions
  const handleSearchCanonical = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const currentQuestion = createdQuestions[currentLinkingIndex];
      const response = await fetch(
        `/api/questions/canonical?q=${encodeURIComponent(query)}&excludeId=${currentQuestion?.id || ""}&limit=10`
      );
      const result = await response.json();
      setSearchResults(result.data?.questions || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle linking the selected question
  const handleLinkSelected = async () => {
    if (!selectedCanonical || currentLinkingIndex >= createdQuestions.length) return;

    const currentQuestion = createdQuestions[currentLinkingIndex];
    setIsLinking(true);

    try {
      const response = await fetch(`/api/questions/${currentQuestion.id}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canonicalId: selectedCanonical.id }),
      });

      if (!response.ok) {
        throw new Error(tQuestion("linking.linkError"));
      }

      const result = await response.json();
      toast.success(tQuestion("linking.linkedSuccess", { count: result.data.group.totalQuestions }));

      // Move to next question or finish
      moveToNextQuestion();
    } catch {
      toast.error(tQuestion("linking.linkError"));
    } finally {
      setIsLinking(false);
    }
  };

  // Skip linking current question and move to next
  const handleSkipLinking = () => {
    moveToNextQuestion();
  };

  // Move to next question or finish the flow
  const moveToNextQuestion = () => {
    const nextIndex = currentLinkingIndex + 1;

    if (nextIndex >= createdQuestions.length) {
      // All questions processed
      setShowLinkModal(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return;
    }

    // Reset search state and move to next question
    setCurrentLinkingIndex(nextIndex);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedCanonical(null);
  };

  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Generate shareable link (only for class representatives)
  const handleGenerateShareableLink = async () => {
    if (!formData.subjectId || !formData.professorId) {
      toast.error(t("selectSubjectAndProfessor"));
      return;
    }

    setIsGeneratingLink(true);

    try {
      // First, create or find an exam
      const examResponse = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: formData.subjectId,
          professorId: formData.professorId,
          universityId: formData.universityId,
          courseId: formData.courseId || undefined,
          year: formData.year || undefined,
        }),
      });

      if (!examResponse.ok) {
        throw new Error(t("creationError"));
      }

      const examResult = await examResponse.json();
      const exam = examResult.data;

      // Then, create a share link
      const shareResponse = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
        }),
      });

      if (!shareResponse.ok) {
        const errorData = await shareResponse.json();
        console.error("Share API error:", errorData);
        throw new Error(errorData.error?.message || "Errore nella creazione del link");
      }

      const shareResult = await shareResponse.json();
      const link = `${window.location.origin}/share/${shareResult.data.slug}`;
      setShareableLink(link);
      setShowShareDialog(true);
    } catch (error) {
      console.error("Erro ao gerar link:", error);
      toast.error(error instanceof Error ? error.message : "Errore nella generazione del link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast.success(t("shareDialog.linkCopied"));
    } catch {
      toast.error(tCommon("error"));
    }
  };

  // Check if at least one question is filled
  const hasValidQuestion = formData.questions.some((q) => q.trim());

  // Get display names for prefill data
  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id;
  const getProfessorName = (id: string) => professors.find((p) => p.id === id)?.name || id;
  const getUniversityName = (id: string) => universities.find((u) => u.id === id)?.name || id;
  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.name || id;

  const filledQuestionsCount = formData.questions.filter((q) => q.trim()).length;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-border text-center animate-scale-in">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">
              {filledQuestionsCount > 1
                ? t("success.titlePlural")
                : t("success.title")}
            </h2>
            <p className="text-muted-foreground">
              {filledQuestionsCount > 1
                ? t("success.descriptionPlural")
                : t("success.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Banner for shared links */}
        {hasPrefill && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[bg-primary/10] via-[bg-primary/20] to-[bg-primary/30] dark:from-[primary]/20 dark:via-[primary]/10 dark:to-[primary]/5 border-2 border-primary/30 shadow-lg animate-slide-in-up">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />

            <div className="relative p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center animate-bounce">
                  <Link2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary">
                    {t("sharedLink.title")}
                  </h3>
                  <p className="text-sm text-primary/80">
                    {t("sharedLink.description")}
                  </p>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {prefillData.subject && (
                  <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-primary/20 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground mb-1">{t("subject")}</p>
                    <p className="font-medium text-foreground">
                      {getSubjectName(prefillData.subject)}
                    </p>
                  </div>
                )}
                {prefillData.professor && (
                  <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-primary/20 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground mb-1">{t("professor")}</p>
                    <p className="font-medium text-foreground">
                      {getProfessorName(prefillData.professor)}
                    </p>
                  </div>
                )}
                {prefillData.courseId && (
                  <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-primary/20 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground mb-1">{t("course")}</p>
                    <p className="font-medium text-foreground">{getCourseName(prefillData.courseId)}</p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm text-primary/90">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>{t("sharedLink.scrollDown")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="space-y-4 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToDashboard")}
          </Button>

          {!hasPrefill && (
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-medium text-foreground">
                {t("contributeTitle")}
              </h1>
              <p className="text-muted-foreground">
                {t("contributeDescription")}
              </p>
            </div>
          )}
        </div>

        {/* Form Card */}
        <Card className="bg-card border-border animate-slide-in-up">
          <CardHeader className="border-b border-border">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-foreground">
                  {t("formTitle")}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t("formDescription")}
                </CardDescription>
              </div>

              {/* Generate link button - available for all users */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-30 group-hover:opacity-60 transition-all" />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerateShareableLink}
                  className="relative flex-shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                  disabled={!formData.subjectId || !formData.professorId || isGeneratingLink}
                >
                  {isGeneratingLink ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {tCommon("loading")}
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      {t("generateLink")}
                      <span className="ml-2 text-xs opacity-75">✨</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Università e Corso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-foreground">
                    {t("university")}
                  </Label>
                  <Input
                    id="university"
                    value={getUniversityName(formData.universityId)}
                    disabled
                    className="bg-muted border-border text-muted-foreground"
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="course" className="text-foreground flex items-center gap-2">
                    {t("course")}
                    {(prefillData.courseId || session?.user?.courseId) && formData.courseId && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {t("fromProfile")}
                      </span>
                    )}
                  </Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => handleInputChange("courseId", value)}
                  >
                    <SelectTrigger
                      disabled={universityCourses.length === 0}
                      className="bg-input border-border text-foreground text-left"
                    >
                      {formData.courseId ? (
                        <span>{getCourseName(formData.courseId)}</span>
                      ) : (
                        <SelectValue placeholder={universityCourses.length === 0 ? t("noCourses") : t("selectCourse")} />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {universityCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Anno e Materia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-foreground">
                    {t("year")}
                  </Label>
                  <Select
                    value={formData.year ? String(formData.year) : ""}
                    onValueChange={(value) => handleInputChange("year", parseInt(value, 10))}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground text-left">
                      {formData.year ? (
                        <span>{t("yearLabel", { year: formData.year })}</span>
                      ) : (
                        <SelectValue placeholder={t("selectYear")} />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {t("yearLabel", { year })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="subject" className="text-foreground flex items-center gap-2">
                    {t("subject")}
                    {prefillData.subject && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {t("prefilled")}
                      </span>
                    )}
                  </Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => handleInputChange("subjectId", value)}
                  >
                    <SelectTrigger
                      disabled={!!prefillData.subject || !formData.courseId || isLoadingSubjects}
                      className={`text-left ${
                        prefillData.subject
                          ? "bg-primary/5 border-primary/30 text-primary cursor-not-allowed"
                          : "bg-input border-border text-foreground"
                      }`}
                    >
                      {isLoadingSubjects ? (
                        <span className="text-muted-foreground">{tCommon("loading")}</span>
                      ) : formData.subjectId ? (
                        <span>{getSubjectName(formData.subjectId)}</span>
                      ) : (
                        <SelectValue placeholder={!formData.courseId ? t("selectCourseFirst") : subjects.length === 0 ? t("noSubjects") : t("selectSubject")} />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="professor" className="text-foreground flex items-center gap-2">
                  {t("professor")}
                  {prefillData.professor && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {t("prefilled")}
                    </span>
                  )}
                </Label>
                <Select
                  value={formData.professorId}
                  onValueChange={(value) => handleInputChange("professorId", value)}
                >
                  <SelectTrigger
                    disabled={!!prefillData.professor || !formData.subjectId || isLoadingProfessors}
                    className={`text-left ${
                      prefillData.professor
                        ? "bg-primary/5 border-primary/30 text-primary cursor-not-allowed"
                        : "bg-input border-border text-foreground"
                    }`}
                  >
                    {isLoadingProfessors ? (
                      <span className="text-muted-foreground">{tCommon("loading")}</span>
                    ) : formData.professorId ? (
                      <span>{getProfessorName(formData.professorId)}</span>
                    ) : (
                      <SelectValue placeholder={!formData.subjectId ? t("selectSubjectFirst") : professors.length === 0 ? t("noProfessors") : t("selectProfessor")} />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {professors.map((professor) => (
                      <SelectItem key={professor.id} value={professor.id}>
                        {professor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Multiple Questions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">{t("examQuestions")}</Label>
                  <span className="text-xs text-muted-foreground">
                    {filledQuestionsCount} {filledQuestionsCount === 1 ? "domanda" : "domande"}
                  </span>
                </div>

                <div className="space-y-3">
                  {formData.questions.map((question, index) => (
                    <div
                      key={index}
                      className="relative group animate-slide-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Question number */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[bg-primary/10] dark:bg-[primary]/10 flex items-center justify-center mt-2 transition-all group-hover:bg-[bg-primary/20] dark:group-hover:bg-[primary]/20">
                          <span className="text-sm text-[primary] dark:text-[#60A5FA]">
                            {index + 1}
                          </span>
                        </div>

                        {/* Text field */}
                        <div className="flex-1">
                          <Textarea
                            placeholder={
                              index === 0
                                ? t("firstQuestionPlaceholder")
                                : t("questionPlaceholder", { number: index + 1 })
                            }
                            value={question}
                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                            className="min-h-24 bg-muted/30 rounded-lg border border-border text-foreground placeholder:text-muted-foreground resize-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            required={index === 0}
                          />
                        </div>

                        {/* Remove button - only shows if there's more than one question */}
                        {formData.questions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                            className="flex-shrink-0 mt-2 h-8 w-8 p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                            title={t("removeQuestion")}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more questions button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddQuestion}
                  className="w-full border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                  {t("addAnotherQuestion")}
                </Button>

                <p className="text-xs text-muted-foreground italic">
                  {t("tip")}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1"
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground transition-all"
                  disabled={
                    !hasValidQuestion ||
                    !formData.subjectId ||
                    !formData.professorId ||
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? t("submitting")
                    : filledQuestionsCount > 1
                      ? t("submitQuestions")
                      : t("submitQuestion")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Alert */}
        {!hasPrefill && (
          <Alert className="bg-card border-border animate-fade-in">
            <AlertDescription className="text-foreground">
              {filledQuestionsCount > 1
                ? t("reviewNoticePlural")
                : t("reviewNotice")}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Share Link Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-lg bg-card border-border overflow-hidden">
          {/* Header with gradient */}
          <div className="relative -mx-6 -mt-6 mb-4 p-6 bg-gradient-to-br from-[bg-primary/10] via-[bg-primary/20] to-[bg-primary/30] dark:from-[primary]/20 dark:via-[primary]/10 dark:to-[primary]/5 border-b border-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                  <DialogTitle className="text-foreground text-xl">
                    {t("shareDialog.title")}
                  </DialogTitle>
                  <DialogDescription className="text-primary/80">
                    {t("shareDialog.description")}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-1">
            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[bg-primary/10] to-[bg-primary/20] dark:from-[primary]/10 dark:to-[primary]/5 rounded-lg p-3 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">{t("shareDialog.subjectLabel")}</p>
                <p className="font-semibold text-primary">
                  {getSubjectName(formData.subjectId)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[bg-primary/10] to-[bg-primary/20] dark:from-[primary]/10 dark:to-[primary]/5 rounded-lg p-3 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">{t("shareDialog.professorLabel")}</p>
                <p className="font-semibold text-primary">
                  {getProfessorName(formData.professorId)}
                </p>
              </div>
              {formData.courseId && (
                <div className="col-span-2 bg-gradient-to-br from-[bg-primary/10] to-[bg-primary/20] dark:from-[primary]/10 dark:to-[primary]/5 rounded-lg p-3 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">{t("shareDialog.courseLabel")}</p>
                  <p className="font-semibold text-primary">{getCourseName(formData.courseId)}</p>
                </div>
              )}
            </div>

            {/* Link with glassmorphism effect */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition-all" />
              <div className="relative bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-lg border border-primary/30 p-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                  <Link2 className="w-3 h-3" />
                  {t("shareDialog.shareableLink")}
                </p>
                <p className="text-sm text-foreground break-all font-mono bg-muted/50 p-2 rounded">
                  {shareableLink}
                </p>
              </div>
            </div>

            {/* Modern buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleCopyLink}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Copy className="w-4 h-4 mr-2" />
                {t("shareDialog.copyLink")}
              </Button>
              <Button
                onClick={() => setShowShareDialog(false)}
                variant="outline"
                className="flex-1 border-primary/30 hover:bg-primary/5 transition-all"
              >
                {tCommon("close")}
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-[#FFF7ED] to-[#FED7AA] dark:from-[accent]/10 dark:to-[accent]/5 rounded-lg p-4 border border-[accent]/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[accent]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-lg">💡</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-[orange-900] dark:text-[accent]">
                    {t("shareDialog.howToShare")}
                  </p>
                  <ul className="text-xs text-[orange-900]/80 dark:text-[accent]/80 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[accent]" />
                      {t("shareDialog.step1")}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[accent]" />
                      {t("shareDialog.step2")}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[accent]" />
                      {t("shareDialog.step3")}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Linking Modal */}
      <Dialog open={showLinkModal} onOpenChange={(open) => !open && handleSkipLinking()}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative -mx-6 -mt-6 p-6 bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0] dark:from-green-900/20 dark:via-green-900/10 dark:to-green-900/5 border-b border-green-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <DialogTitle className="text-foreground text-xl flex items-center gap-2">
                    {tQuestion("linking.title")}
                  </DialogTitle>
                  <DialogDescription className="text-green-700/80 dark:text-green-400/80">
                    {tQuestion("linking.ofTotal", { current: currentLinkingIndex + 1, total: createdQuestions.length })}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 p-1">
            {/* Current question being processed */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                {tQuestion("linking.yourQuestion")}
              </p>
              <p className="text-foreground font-medium">
                {createdQuestions[currentLinkingIndex]?.text}
              </p>
            </div>

            {/* Explanation */}
            <div className="bg-[bg-primary/10] dark:bg-[primary]/10 rounded-lg p-3 border-l-4 border-[primary]">
              <p className="text-sm text-foreground leading-relaxed m-0">
                {tQuestion("linking.explanation")}
              </p>
            </div>

            {/* Search Input */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{tQuestion("linking.searchExisting")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={tQuestion("linking.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => handleSearchCanonical(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">{tCommon("loading")}</span>
                </div>
              )}

              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {tQuestion("linking.noResults")}
                </p>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {searchResults.map((question) => (
                    <button
                      key={question.id}
                      onClick={() => setSelectedCanonical(question)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedCanonical?.id === question.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedCanonical?.id === question.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}>
                          <GitBranch className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm line-clamp-2">
                            {question.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {question.variationsCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {tQuestion("variations.timesAsked", { count: question.variationsCount + 1 })}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {question.professor && `${question.professor} • `}{question.subject}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Question Preview */}
              {selectedCanonical && (
                <div className="p-3 rounded-lg border border-green-500/50 bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs text-green-700 dark:text-green-400 mb-1 font-medium">
                    {tQuestion("linking.selectedQuestion")}
                  </p>
                  <p className="text-sm text-foreground line-clamp-2">
                    {selectedCanonical.text}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-4 mt-4 flex justify-between items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleSkipLinking}
              disabled={isLinking}
              className="text-muted-foreground hover:text-foreground"
            >
              {currentLinkingIndex + 1 >= createdQuestions.length ? tQuestion("linking.finishWithoutLinking") : tQuestion("linking.skip")}
            </Button>
            <Button
              onClick={handleLinkSelected}
              disabled={!selectedCanonical || isLinking}
              className="bg-primary hover:bg-primary/90"
            >
              {isLinking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {tQuestion("linking.linking")}
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  {tQuestion("linking.link")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
