"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  CheckCircle,
  Plus,
  X,
  Link2,
  AlertTriangle,
  Clock,
  User,
  Search,
  BookOpen,
  GitBranch,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ShareLink {
  id: string;
  slug: string;
  isExpired: boolean;
  clickCount: number;
  expiresAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
  exam: {
    id: string;
    subjectId: string;
    professorId: string | null;
    universityId: string;
    courseId: string | null;
    year: number | null;
    subject: {
      id: string;
      name: string;
      emoji: string | null;
    };
    professor: {
      id: string;
      name: string;
    } | null;
    university: {
      id: string;
      name: string;
      shortName: string | null;
    };
    course: {
      id: string;
      name: string;
    } | null;
  };
}

interface Professor {
  id: string;
  name: string;
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

interface ShareExamFormProps {
  shareLink: ShareLink;
  professors: Professor[];
  session: Session | null;
}

export function ShareExamForm({ shareLink, professors, session }: ShareExamFormProps) {
  const router = useRouter();
  const status = session ? "authenticated" : "unauthenticated";
  const t = useTranslations("exam");
  const tShare = useTranslations("share");
  const tCommon = useTranslations("common");
  const tQuestion = useTranslations("question");
  const tAuth = useTranslations("auth");

  const [formData, setFormData] = useState({
    professorId: shareLink.exam.professor?.id || "",
    questions: [""],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Question Linking States
  const [createdQuestions, setCreatedQuestions] = useState<CreatedQuestion[]>([]);
  const [currentLinkingIndex, setCurrentLinkingIndex] = useState(0);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CanonicalQuestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCanonical, setSelectedCanonical] = useState<CanonicalQuestion | null>(null);

  // Login Modal States
  const [showLoginModal, setShowLoginModal] = useState(!session);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { exam } = shareLink;

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success(tShare("loginSuccess"));
        setShowLoginModal(false);
        // Refresh page to get session
        router.refresh();
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsLoggingIn(false);
    }
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

    if (!session?.user?.id) {
      toast.error(tShare("loginRequired"));
      router.push("/login");
      return;
    }

    const filledQuestions = formData.questions.filter((q) => q.trim());
    if (filledQuestions.length === 0) return;

    setIsSubmitting(true);

    try {
      // Create or find an exam with the selected professor
      const examResponse = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: exam.subjectId,
          professorId: formData.professorId,
          universityId: exam.universityId,
          courseId: exam.courseId || undefined,
          year: exam.year || undefined,
        }),
      });

      if (!examResponse.ok) {
        throw new Error(t("creationError"));
      }

      const examResult = await examResponse.json();
      const newExam = examResult.data;

      // Create all questions
      const questionResponses = await Promise.all(
        filledQuestions.map(async (text) => {
          const response = await fetch("/api/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId: newExam.id,
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

      setCreatedQuestions(questionResponses);

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

      moveToNextQuestion();
    } catch {
      toast.error(tQuestion("linking.linkError"));
    } finally {
      setIsLinking(false);
    }
  };

  const handleSkipLinking = () => {
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    const nextIndex = currentLinkingIndex + 1;

    if (nextIndex >= createdQuestions.length) {
      setShowLinkModal(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return;
    }

    setCurrentLinkingIndex(nextIndex);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedCanonical(null);
  };

  const hasValidQuestion = formData.questions.some((q) => q.trim());
  const filledQuestionsCount = formData.questions.filter((q) => q.trim()).length;

  // Show expired message
  if (shareLink.isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-border text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">
              {tShare("expired.title")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {tShare("expired.description")}
            </p>
            <Button onClick={() => router.push("/exams/new")}>
              {tShare("expired.createNew")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success message
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-border text-center animate-scale-in">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">
              {filledQuestionsCount > 1 ? t("success.titlePlural") : t("success.title")}
            </h2>
            <p className="text-muted-foreground">
              {filledQuestionsCount > 1 ? t("success.descriptionPlural") : t("success.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Shared Link Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[primary/10] via-[primary/20] to-[primary/30] dark:from-[primary]/20 dark:via-[primary]/10 dark:to-[primary]/5 border-2 border-primary/30 shadow-lg animate-slide-in-up">
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
              <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-primary/20 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-1">{t("university")}</p>
                <p className="font-medium text-foreground">
                  {exam.university.shortName || exam.university.name}
                </p>
              </div>
              <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-primary/20 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-1">{t("subject")}</p>
                <p className="font-medium text-foreground">
                  {exam.subject.emoji} {exam.subject.name}
                </p>
              </div>
              {exam.course && (
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-primary/20 backdrop-blur-sm">
                  <p className="text-xs text-muted-foreground mb-1">{t("course")}</p>
                  <p className="font-medium text-foreground">{exam.course.name}</p>
                </div>
              )}
            </div>

            {/* Shared by */}
            <div className="flex items-center gap-2 text-sm text-primary/90">
              <User className="w-4 h-4" />
              <span>{tShare("sharedBy", { name: shareLink.createdBy.name })}</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-card border-border animate-slide-in-up">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground">
              {tShare("addQuestions")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {tShare("addQuestionsDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Professor Selection (editable) */}
              <div className="space-y-2">
                <Label htmlFor="professor" className="text-foreground flex items-center gap-2">
                  {t("professor")}
                  <Badge variant="outline" className="text-xs">
                    {tShare("canChange")}
                  </Badge>
                </Label>
                <Select
                  value={formData.professorId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, professorId: value }))}
                >
                  <SelectTrigger className="bg-input border-border text-foreground text-left">
                    {formData.professorId ? (
                      <span>{professors.find((p) => p.id === formData.professorId)?.name}</span>
                    ) : (
                      <SelectValue placeholder={t("selectProfessor")} />
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
                <p className="text-xs text-muted-foreground">
                  {tShare("professorHint")}
                </p>
              </div>

              {/* Questions Section */}
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
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[primary/10] dark:bg-[primary]/10 flex items-center justify-center mt-2 transition-all group-hover:bg-[primary/20] dark:group-hover:bg-[primary]/20">
                          <span className="text-sm text-[primary] dark:text-[primary]">
                            {index + 1}
                          </span>
                        </div>

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
                  disabled={!hasValidQuestion || !formData.professorId || isSubmitting}
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
        <Alert className="bg-card border-border animate-fade-in">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-foreground">
            {filledQuestionsCount > 1 ? t("reviewNoticePlural") : t("reviewNotice")}
          </AlertDescription>
        </Alert>
      </div>

      {/* Question Linking Modal */}
      <Dialog open={showLinkModal} onOpenChange={(open) => !open && handleSkipLinking()}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-hidden flex flex-col">
          <div className="relative -mx-6 -mt-6 p-6 bg-gradient-to-br from-[green-50] via-[green-100] to-[green-200] dark:from-green-900/20 dark:via-green-900/10 dark:to-green-900/5 border-b border-green-500/20">
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
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                {tQuestion("linking.yourQuestion")}
              </p>
              <p className="text-foreground font-medium">
                {createdQuestions[currentLinkingIndex]?.text}
              </p>
            </div>

            <div className="bg-[primary/10] dark:bg-[primary]/10 rounded-lg p-3 border-l-4 border-[primary]">
              <p className="text-sm text-foreground leading-relaxed m-0">
                {tQuestion("linking.explanation")}
              </p>
            </div>

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

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-medium text-foreground">
                {tShare("loginRequired")}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                {tShare("loginDescription")}
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-input border-border text-foreground"
                required
                disabled={isLoggingIn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                {tAuth("password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="bg-input border-border text-foreground"
                required
                disabled={isLoggingIn}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {tCommon("loading")}
                  </>
                ) : (
                  tShare("login")
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {tShare("noAccount")}{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => router.push(`/register?callbackUrl=/share/${shareLink.slug}`)}
                >
                  {tShare("register")}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
