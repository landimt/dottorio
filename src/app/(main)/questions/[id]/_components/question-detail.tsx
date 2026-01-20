"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ThumbsUp,
  Star,
  Copy,
  BookOpen,
  CheckCircle,
  MessageCircle,
  Send,
  Eye,
  StickyNote,
  Bookmark,
  BookmarkCheck,
  Users,
  Lock,
  Globe,
  ChevronDown,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  views: number;
  examId: string;
  isSaved: boolean;
  groupId: string | null;
  isCanonical: boolean;
  canonical: { id: string; text: string } | null;
  exam: {
    id: string;
    subject: { id: string; name: string; emoji: string | null };
    professor: { id: string; name: string } | null;
    university: { id: string; name: string };
  };
  aiAnswer: {
    id: string;
    content: string;
    model: string | null;
  } | null;
  studentAnswers: StudentAnswer[];
  comments: Comment[];
  personalAnswer: {
    id: string;
    content: string;
    isPublic: boolean;
  } | null;
  _count: {
    studentAnswers: number;
    comments: number;
    savedBy: number;
  };
}

interface QuestionVariation {
  id: string;
  text: string;
  createdAt: Date;
  exam: {
    professor: { name: string } | null;
    university: { name: string };
  };
  _count: {
    studentAnswers: number;
  };
}

interface StudentAnswer {
  id: string;
  content: string;
  isPublic: boolean;
  createdAt: Date;
  isLiked: boolean;
  likesCount: number;
  user: {
    id: string;
    name: string | null;
    university: { name: string } | null;
    year: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  isLiked: boolean;
  likesCount: number;
  user: {
    id: string;
    name: string | null;
    university: { name: string } | null;
    year: number;
  };
}

interface RelatedQuestion {
  id: string;
  text: string;
  views: number;
  exam: {
    professor: { name: string } | null;
  };
  _count: {
    studentAnswers: number;
    savedBy: number;
  };
}

interface QuestionDetailProps {
  question: Question;
  relatedQuestions: RelatedQuestion[];
  variations: QuestionVariation[];
  userId?: string;
}

export function QuestionDetail({
  question,
  relatedQuestions,
  variations,
  userId,
}: QuestionDetailProps) {
  const router = useRouter();
  const t = useTranslations("question");
  const tCommon = useTranslations("common");
  const tHeader = useTranslations("header");

  // States
  const [saved, setSaved] = useState(question.isSaved);
  const [activeTab, setActiveTab] = useState<
    "ai-answer" | "student-answers" | "my-answer" | "comments"
  >("ai-answer");
  const [personalAnswer, setPersonalAnswer] = useState(
    question.personalAnswer?.content || ""
  );
  const [isEditingPersonalAnswer, setIsEditingPersonalAnswer] = useState(
    !question.personalAnswer
  );
  const [isAnswerPublic, setIsAnswerPublic] = useState(
    question.personalAnswer?.isPublic || false
  );
  const [newComment, setNewComment] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiRating, setAiRating] = useState<number | null>(null);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [aiRatingFeedback, setAiRatingFeedback] = useState("");

  // Filter and sort states
  const [questionFilter, setQuestionFilter] = useState<"all" | "saved">("all");
  const [questionSort, setQuestionSort] = useState<"views" | "recent">("views");
  const [sortBy, setSortBy] = useState<"likes" | "recent">("likes");

  // Mobile dropdown state
  const [isQuestionDropdownOpen, setIsQuestionDropdownOpen] = useState(false);

  // Variations dialog
  const [isVariationsDialogOpen, setIsVariationsDialogOpen] = useState(false);

  // Student answers with local state for likes
  const [studentAnswers, setStudentAnswers] = useState(question.studentAnswers);
  const [comments, setComments] = useState(question.comments);

  // All questions for sidebar (current + related)
  const allQuestions = [
    {
      id: question.id,
      text: question.text,
      views: question.views,
      professor: question.exam.professor?.name || "N/A",
      isCurrent: true,
    },
    ...relatedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      views: q.views,
      professor: q.exam.professor?.name || "N/A",
      isCurrent: false,
    })),
  ];

  // Filter and sort questions
  const getFilteredQuestions = () => {
    let filtered = [...allQuestions];

    // Apply sorting
    if (questionSort === "views") {
      filtered.sort((a, b) => b.views - a.views);
    }

    return filtered;
  };

  // Total variations count (including current question)
  const variationsCount = variations.length + 1;
  const hasVariations = variations.length > 0;

  const handleToggleSave = async () => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    try {
      const response = await fetch(`/api/questions/${question.id}/save`, {
        method: "POST",
      });

      if (response.ok) {
        setSaved(!saved);
        toast.success(saved ? t("removedFromSaved") : t("addedToSaved"));
      }
    } catch {
      toast.error(tCommon("error"));
    }
  };

  const handleCopyAnswer = async () => {
    if (question.aiAnswer) {
      await navigator.clipboard.writeText(question.aiAnswer.content);
      setCopied(true);
      toast.success(tCommon("copied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSavePersonalAnswer = async () => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    if (!personalAnswer.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/questions/${question.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: personalAnswer,
          isPublic: isAnswerPublic,
        }),
      });

      if (response.ok) {
        setIsEditingPersonalAnswer(false);
        toast.success(
          isAnswerPublic
            ? t("myAnswer.savedAndShared")
            : t("myAnswer.savedSuccess")
        );
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLikeAnswer = async (answerId: string) => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    try {
      const response = await fetch(`/api/answers/${answerId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const { data } = await response.json();
        setStudentAnswers((prev) =>
          prev.map((a) =>
            a.id === answerId
              ? {
                  ...a,
                  isLiked: data.liked,
                  likesCount: data.liked ? a.likesCount + 1 : a.likesCount - 1,
                }
              : a
          )
        );
      }
    } catch {
      toast.error(tCommon("error"));
    }
  };

  const handleToggleLikeComment = async (commentId: string) => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const { data } = await response.json();
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  isLiked: data.liked,
                  likesCount: data.liked ? c.likesCount + 1 : c.likesCount - 1,
                }
              : c
          )
        );
      }
    } catch {
      toast.error(tCommon("error"));
    }
  };

  const handlePublishComment = async () => {
    if (!userId) {
      toast.error(t("loginToSave"));
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/questions/${question.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const { data: comment } = await response.json();
        setComments((prev) => [
          {
            ...comment,
            isLiked: false,
            likesCount: 0,
          },
          ...prev,
        ]);
        setNewComment("");
        toast.success(t("experiences.published"));
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIRating = async (rating: number) => {
    if (!userId || !question.aiAnswer) return;

    setAiRating(rating);

    if (rating < 3) {
      setShowFeedbackInput(true);
    } else {
      setShowFeedbackInput(false);
      setAiRatingFeedback("");
      toast.success(t("aiAnswer.ratingThanks", { rating }));

      try {
        await fetch(`/api/ai-answers/${question.aiAnswer.id}/rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating }),
        });
      } catch {
        // Ignore rating errors
      }
    }
  };

  const handleSubmitAIFeedback = async () => {
    if (!aiRating || !aiRatingFeedback.trim() || !question.aiAnswer) return;

    try {
      await fetch(`/api/ai-answers/${question.aiAnswer.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: aiRating, feedback: aiRatingFeedback }),
      });
      toast.success(t("aiAnswer.feedbackSent"), {
        description: t("aiAnswer.feedbackThanks"),
      });
      setShowFeedbackInput(false);
      setAiRatingFeedback("");
    } catch {
      // Ignore errors
    }
  };

  const getSortedComments = () => {
    const sorted = [...comments];
    if (sortBy === "likes") {
      return sorted.sort((a, b) => b.likesCount - a.likesCount);
    }
    return sorted.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUniversityInfo = (universityName: string | undefined) => {
    if (!universityName) return { short: "N/A", colorClass: "text-purple-400 bg-purple-50 border-purple-200" };

    const universityMap: Record<string, { short: string; colorClass: string }> = {
      "La Sapienza": { short: "Sapienza", colorClass: "text-orange-400 bg-orange-50 border-orange-200" },
      "Università di Bologna": { short: "UniBO", colorClass: "text-purple-400 bg-purple-50 border-purple-200" },
      "Università di Milano": { short: "UniMI", colorClass: "text-blue-400 bg-blue-50 border-blue-200" },
    };

    return (
      universityMap[universityName] || {
        short: universityName.slice(0, 8),
        colorClass: "text-purple-400 bg-purple-50 border-purple-200",
      }
    );
  };

  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/search")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToSearch")}
          </Button>

          {/* Mobile Question Selector */}
          <div className="md:hidden mb-4">
            <Card className="p-3 bg-gradient-to-br from-card to-muted border-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-sm">
                  {question.exam.subject.emoji} {question.exam.subject.name}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs px-2 py-0.5"
                >
                  {filteredQuestions.findIndex((q) => q.id === question.id) + 1}{" "}
                  / {filteredQuestions.length}
                </Badge>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Select
                  value={questionFilter}
                  onValueChange={(v) =>
                    setQuestionFilter(v as "all" | "saved")
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue>
                      {questionFilter === "all" ? t("sidebar.filterAll") : t("sidebar.filterSaved")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("sidebar.filterAll")}</SelectItem>
                    <SelectItem value="saved">{t("sidebar.filterSaved")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={questionSort}
                  onValueChange={(v) =>
                    setQuestionSort(v as "views" | "recent")
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue>
                      {questionSort === "views" ? t("sidebar.sortViews") : t("sidebar.sortRecent")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">{t("sidebar.sortViews")}</SelectItem>
                    <SelectItem value="recent">{t("sidebar.sortRecent")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Dropdown */}
              <div className="relative">
                <button
                  onClick={() =>
                    setIsQuestionDropdownOpen(!isQuestionDropdownOpen)
                  }
                  className="w-full h-auto min-h-[40px] text-sm px-3 py-2 rounded-md border-2 border-border bg-white dark:bg-gray-800 text-foreground font-medium hover:border-[#005A9C] transition-all flex items-center justify-between gap-2 text-left"
                >
                  <span className="flex-1 leading-relaxed">
                    {filteredQuestions.findIndex((q) => q.id === question.id) +
                      1}
                    . {question.text}
                    <span className="block text-xs text-muted-foreground mt-1">
                      {question.exam.professor?.name || "N/A"}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${
                      isQuestionDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isQuestionDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsQuestionDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-lg shadow-xl z-20 max-h-[300px] overflow-y-auto">
                      {filteredQuestions.map((q, index) => (
                        <button
                          key={q.id}
                          onClick={() => {
                            if (q.id !== question.id) {
                              router.push(`/questions/${q.id}`);
                            }
                            setIsQuestionDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-3 text-sm text-left hover:bg-primary/5 transition-colors border-b border-border last:border-b-0 flex items-start gap-2 ${
                            q.id === question.id ? "bg-primary/10" : ""
                          }`}
                        >
                          <span className="font-semibold text-primary flex-shrink-0 min-w-[24px]">
                            {index + 1}.
                          </span>
                          <span className="flex-1 leading-relaxed">
                            {q.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 min-h-[calc(100vh-180px)]">
          {/* Left Column - Related Questions (Hidden on mobile) */}
          <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border overflow-hidden flex-col">
            <div className="p-4 border-b border-border bg-muted/30 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("sidebar.questions", { subject: question.exam.subject.name })}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("sidebar.questionsCount", { shown: filteredQuestions.length, total: filteredQuestions.length })}
                </p>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <Select
                  value={questionFilter}
                  onValueChange={(v) =>
                    setQuestionFilter(v as "all" | "saved")
                  }
                >
                  <SelectTrigger className="h-9 text-sm border-2">
                    <SelectValue>
                      {questionFilter === "all" ? t("sidebar.filterAll") : t("sidebar.filterSaved")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("sidebar.filterAll")}</SelectItem>
                    <SelectItem value="saved">{t("sidebar.filterSaved")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={questionSort}
                  onValueChange={(v) =>
                    setQuestionSort(v as "views" | "recent")
                  }
                >
                  <SelectTrigger className="h-9 text-sm border-2">
                    <SelectValue>
                      {questionSort === "views" ? t("sidebar.sortViews") : t("sidebar.sortRecent")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">{t("sidebar.sortViews")}</SelectItem>
                    <SelectItem value="recent">{t("sidebar.sortRecent")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filteredQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    if (q.id !== question.id) {
                      router.push(`/questions/${q.id}`);
                    }
                  }}
                  className={`w-full text-left p-4 transition-all hover:bg-muted/50 ${
                    q.id === question.id
                      ? "bg-primary/10 border-l-4 border-l-primary"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p
                      className={`text-sm line-clamp-2 leading-relaxed ${
                        q.id === question.id
                          ? "text-primary font-medium"
                          : "text-foreground"
                      }`}
                    >
                      {q.text}
                    </p>
                    {q.id === question.id && saved && (
                      <BookmarkCheck className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{q.professor}</span>
                    {hasVariations && q.isCurrent && (
                      <>
                        <span>•</span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsVariationsDialogOpen(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              setIsVariationsDialogOpen(true);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 transition-all duration-200 border border-primary/30 hover:border-primary cursor-pointer"
                          title={t("variations.title")}
                        >
                          <GitBranch className="w-3 h-3" />
                          <span className="font-medium">{variationsCount}x</span>
                        </span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Center Column - Question Detail */}
          <div className="col-span-12 md:col-span-6 bg-card rounded-lg border border-border overflow-hidden flex flex-col">
            {/* Question Header */}
            <div className="p-4 md:p-6 border-b border-border">
              <div className="flex items-start justify-between mb-4 gap-2">
                <h1 className="text-lg md:text-xl font-semibold text-foreground flex-1">
                  {question.text}
                </h1>
                <Button
                  variant={saved ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleSave}
                  className={
                    saved
                      ? "bg-primary hover:bg-primary/90 flex-shrink-0"
                      : "flex-shrink-0"
                  }
                >
                  {saved ? (
                    <BookmarkCheck className="w-4 h-4 md:mr-2" />
                  ) : (
                    <Bookmark className="w-4 h-4 md:mr-2" />
                  )}
                  <span className="hidden md:inline">
                    {saved ? t("saved") : t("save")}
                  </span>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {question.exam.professor?.name || "N/A"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-accent/10 text-accent border-accent/20"
                >
                  {question.exam.university.name}
                </Badge>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{t("views", { count: question.views })}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                className="w-full"
              >
                <TabsList className="w-full mb-6 grid grid-cols-2 md:grid-cols-3 gap-1 h-12 p-1 bg-muted/50 rounded-xl">
                  <TabsTrigger
                    value="ai-answer"
                    className="flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{t("tabs.aiAnswer")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="student-answers"
                    className="flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>{t("tabs.studentAnswers")}</span>
                    <span className="text-xs text-muted-foreground">
                      {studentAnswers.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="my-answer"
                    className="flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <StickyNote className="w-4 h-4" />
                    <span>{t("tabs.myAnswer")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="col-span-2 md:hidden flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t("tabs.experiences")}</span>
                    <span className="text-xs text-muted-foreground">
                      {comments.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* AI Answer Tab */}
                <TabsContent value="ai-answer" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 border-l-4 border-primary pl-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h2 className="font-medium text-foreground">
                        {t("aiAnswer.title")}
                      </h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAnswer}
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? tCommon("copied") : tCommon("copy")}
                    </Button>
                  </div>

                  {/* AI Rating */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">
                          {t("aiAnswer.rateAnswer")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleAIRating(star)}
                            className="transition-all hover:scale-110"
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                aiRating && star <= aiRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground hover:text-yellow-400"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {showFeedbackInput && aiRating && aiRating < 3 && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <label className="text-sm font-medium">
                          {t("aiAnswer.whatDidntYouLike")}
                        </label>
                        <Textarea
                          value={aiRatingFeedback}
                          onChange={(e) => setAiRatingFeedback(e.target.value)}
                          placeholder={t("aiAnswer.describeProblem")}
                          className="min-h-[80px] text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowFeedbackInput(false);
                              setAiRatingFeedback("");
                            }}
                          >
                            {tCommon("cancel")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSubmitAIFeedback}
                            disabled={!aiRatingFeedback.trim()}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            {tCommon("submit")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Answer Content */}
                  {question.aiAnswer ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {/* Callout intro */}
                      <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary mb-4">
                        <p className="text-sm leading-relaxed text-foreground m-0">
                          {t("aiAnswer.intro")}
                        </p>
                      </div>

                      <div
                        className="text-sm leading-relaxed text-foreground whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(question.aiAnswer.content),
                        }}
                      />

                      {/* Key points callout */}
                      <div className="bg-accent/10 rounded-lg p-4 border-l-4 border-accent mt-6">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">💡</span>
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2 mt-0">
                              {t("aiAnswer.keyPoints")}
                            </p>
                            <p className="text-sm text-muted-foreground m-0">
                              {t("aiAnswer.keyPointsDescription")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t("aiAnswer.notAvailable")}</p>
                      <p className="text-sm">
                        {t("aiAnswer.comingSoon")}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Student Answers Tab */}
                <TabsContent value="student-answers" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 border-l-4 border-primary pl-3">
                      <Users className="w-5 h-5 text-primary" />
                      <h2 className="font-medium text-foreground">
                        {t("studentAnswers.title")}
                      </h2>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border">
                    {t.rich("studentAnswers.description", {
                      count: studentAnswers.length,
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </div>

                  {studentAnswers.length > 0 ? (
                    <div className="space-y-4">
                      {studentAnswers.map((answer) => {
                        const uniInfo = getUniversityInfo(
                          answer.user.university?.name
                        );
                        return (
                          <Card
                            key={answer.id}
                            className="p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(answer.user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-foreground">
                                    {answer.user.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs border ${uniInfo.colorClass}`}
                                  >
                                    {uniInfo.short}
                                  </Badge>
                                  {answer.user.year && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-muted"
                                    >
                                      {tHeader("year", { year: answer.user.year })}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap">
                              {answer.content}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleToggleLikeAnswer(answer.id)
                                }
                                className={`h-8 ${
                                  answer.isLiked
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <ThumbsUp
                                  className={`w-4 h-4 mr-2 ${
                                    answer.isLiked ? "fill-primary/30" : ""
                                  }`}
                                />
                                {answer.likesCount}{" "}
                                {answer.likesCount === 1 ? t("studentAnswers.like") : t("studentAnswers.likes")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(answer.content);
                                  toast.success(tCommon("copied"));
                                }}
                                className="h-8"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                {tCommon("copy")}
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground mb-2">
                        {t("studentAnswers.noAnswers")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("studentAnswers.beFirst")}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* My Answer Tab */}
                <TabsContent value="my-answer" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 border-l-4 border-accent pl-3">
                      <StickyNote className="w-5 h-5 text-accent" />
                      <h2 className="font-medium text-foreground">
                        {isEditingPersonalAnswer
                          ? t("myAnswer.writeTitle")
                          : t("myAnswer.title")}
                      </h2>
                    </div>

                    {!isEditingPersonalAnswer && personalAnswer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingPersonalAnswer(true)}
                        className="border-accent text-accent hover:bg-accent/10"
                      >
                        {tCommon("edit")}
                      </Button>
                    )}
                  </div>

                  <div className="bg-muted/30 rounded-lg border border-border p-4">
                    {isEditingPersonalAnswer ? (
                      <Textarea
                        value={personalAnswer}
                        onChange={(e) => setPersonalAnswer(e.target.value)}
                        placeholder={t("myAnswer.placeholder")}
                        className="min-h-[200px] text-sm"
                      />
                    ) : (
                      <div className="min-h-[200px] text-sm leading-relaxed whitespace-pre-wrap">
                        {personalAnswer || (
                          <span className="text-muted-foreground">
                            {t("myAnswer.noAnswer")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditingPersonalAnswer && personalAnswer.trim() && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-muted-foreground">
                              {t("myAnswer.words", { count: personalAnswer.split(/\s+/).filter((word) => word.length > 0).length })}
                            </span>
                          </div>
                          <div className="h-4 w-px bg-border" />
                          <button
                            onClick={() => setIsAnswerPublic(!isAnswerPublic)}
                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          >
                            {isAnswerPublic ? (
                              <>
                                <Globe className="w-4 h-4 text-primary" />
                                <span className="text-primary font-medium">
                                  {t("myAnswer.public")}
                                </span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {t("myAnswer.private")}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                        <Button
                          onClick={handleSavePersonalAnswer}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          size="sm"
                          disabled={isSubmitting}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isSubmitting ? t("myAnswer.saving") : tCommon("save")}
                        </Button>
                      </div>

                      {isAnswerPublic && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
                          <Users className="w-4 h-4 text-primary mt-0.5" />
                          <p className="text-sm text-primary">
                            {t("myAnswer.publicNotice")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isEditingPersonalAnswer && personalAnswer && (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {t("myAnswer.savedLabel")} •{" "}
                          {t("myAnswer.words", { count: personalAnswer.split(/\s+/).filter((word) => word.length > 0).length })}
                        </span>
                      </div>
                      <Button
                        onClick={() => setActiveTab("ai-answer")}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="sm"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        {t("myAnswer.compareWithAI")}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Comments Tab (Mobile Only) */}
                <TabsContent
                  value="comments"
                  className="space-y-4 mt-0 md:hidden"
                >
                  <CommentsSection
                    comments={getSortedComments()}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onPublish={handlePublishComment}
                    onToggleLike={handleToggleLikeComment}
                    isSubmitting={isSubmitting}
                    getInitials={getInitials}
                    getUniversityInfo={getUniversityInfo}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    t={t}
                    tCommon={tCommon}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column - Comments (Hidden on mobile) */}
          <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border overflow-hidden flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">
                    {t("experiences.title")}
                  </h3>
                </div>
                <Badge variant="outline" className="rounded-full px-2.5">
                  {comments.length}
                </Badge>
              </div>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as "likes" | "recent")}
              >
                <SelectTrigger className="h-9 text-sm border-2">
                  <SelectValue>
                    {sortBy === "likes" ? t("experiences.sortByLikes") : t("experiences.sortByRecent")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="likes">{t("experiences.sortByLikes")}</SelectItem>
                  <SelectItem value="recent">{t("experiences.sortByRecent")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto">
              <CommentsSection
                comments={getSortedComments()}
                newComment={newComment}
                setNewComment={setNewComment}
                onPublish={handlePublishComment}
                onToggleLike={handleToggleLikeComment}
                isSubmitting={isSubmitting}
                getInitials={getInitials}
                getUniversityInfo={getUniversityInfo}
                isDesktop
                t={t}
                tCommon={tCommon}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Variations Dialog */}
      <Dialog
        open={isVariationsDialogOpen}
        onOpenChange={setIsVariationsDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#005A9C]" />
              {t("variations.title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("variations.description", { count: variationsCount })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* Current Question - show if it's the canonical */}
            <Card
              className={`p-4 ${
                question.isCanonical
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <Badge
                  className={
                    question.isCanonical
                      ? "bg-primary text-primary-foreground shrink-0"
                      : "bg-muted text-muted-foreground shrink-0"
                  }
                >
                  {question.isCanonical ? t("variations.main") : t("variations.current")}
                </Badge>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {question.text}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{question.exam.professor?.name || "N/A"}</span>
                    <span>•</span>
                    <span>{question.exam.university.name}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* If current is not canonical, show the canonical question */}
            {!question.isCanonical && question.canonical && (
              <Card
                className="p-4 border-2 border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => router.push(`/questions/${question.canonical!.id}`)}
              >
                <div className="flex items-start gap-3">
                  <Badge className="bg-primary text-primary-foreground shrink-0">
                    {t("variations.main")}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      {question.canonical.text}
                    </p>
                    <p className="text-xs text-primary">
                      {t("variations.viewMain")}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Other Variations */}
            {variations.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                  {t("variations.otherVariations")}
                </p>
                <div className="space-y-2">
                  {variations.map((variation, index) => (
                    <Card
                      key={variation.id}
                      className="p-4 border border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                      onClick={() => router.push(`/questions/${variation.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant="outline"
                          className="shrink-0 border-border text-muted-foreground"
                        >
                          #{index + 1}
                        </Badge>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm text-foreground">
                            {variation.text}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>
                              {variation.exam.professor?.name || "N/A"}
                            </span>
                            <span>•</span>
                            <span>{variation.exam.university.name}</span>
                            <span>•</span>
                            <span>
                              {new Date(variation.createdAt).toLocaleDateString(
                                "it-IT"
                              )}
                            </span>
                            {variation._count.studentAnswers > 0 && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>
                                    {t("variations.answers", { count: variation._count.studentAnswers })}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={() => setIsVariationsDialogOpen(false)}
              variant="outline"
              className="hover:bg-muted"
            >
              {tCommon("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Comments Section Component
function CommentsSection({
  comments,
  newComment,
  setNewComment,
  onPublish,
  onToggleLike,
  isSubmitting,
  getInitials,
  getUniversityInfo,
  isDesktop = false,
  sortBy,
  setSortBy,
  t,
  tCommon,
}: {
  comments: Comment[];
  newComment: string;
  setNewComment: (v: string) => void;
  onPublish: () => void;
  onToggleLike: (id: string) => void;
  isSubmitting: boolean;
  getInitials: (name: string | null) => string;
  getUniversityInfo: (name: string | undefined) => { short: string; colorClass: string };
  isDesktop?: boolean;
  sortBy?: "likes" | "recent";
  setSortBy?: (v: "likes" | "recent") => void;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className={isDesktop ? "flex flex-col h-full" : "space-y-4"}>
      {/* Mobile header with sort */}
      {!isDesktop && sortBy && setSortBy && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 border-l-4 border-primary pl-3">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-medium text-foreground">
              {t("experiences.title")}
            </h2>
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "likes" | "recent")}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue>
                {sortBy === "likes" ? t("experiences.sortByLikes") : t("experiences.sortByRecent")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="likes">{t("experiences.sortByLikes")}</SelectItem>
              <SelectItem value="recent">{t("experiences.sortByRecent")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tips */}
      {!isDesktop && (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border">
          {t("experiences.description")}
        </div>
      )}

      {/* Comments List */}
      <div
        className={
          isDesktop ? "flex-1 overflow-y-auto p-4 space-y-4" : "space-y-4"
        }
      >
        {comments.map((comment) => {
          const uniInfo = getUniversityInfo(comment.user.university?.name);
          return (
            <div key={comment.id} className={isDesktop ? "pb-4 border-b border-border last:border-b-0" : ""}>
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-foreground">
                      {comment.user.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs rounded-full px-2 border ${uniInfo.colorClass}`}
                    >
                      {uniInfo.short}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-3">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button
                      onClick={() => onToggleLike(comment.id)}
                      className={`flex items-center gap-1.5 hover:text-foreground transition-colors ${
                        comment.isLiked ? "text-primary" : ""
                      }`}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${
                          comment.isLiked ? "fill-current" : ""
                        }`}
                      />
                      <span>{comment.likesCount}</span>
                    </button>
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString("it-IT", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              {t("experiences.noExperiences")}
            </p>
          </div>
        )}
      </div>

      {/* Add Comment */}
      <div
        className={isDesktop ? "p-4 border-t border-border" : ""}
      >
        <div className="space-y-3">
          {!isDesktop && (
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>{t("experiences.shareYours")}</span>
            </div>
          )}
          <Textarea
            placeholder={t("experiences.placeholder")}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] text-sm resize-none border-2"
          />
          <div className="flex justify-end">
            <Button
              onClick={onPublish}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6"
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? t("experiences.publishing") : t("experiences.publish")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
