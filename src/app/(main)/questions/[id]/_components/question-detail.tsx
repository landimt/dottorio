"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface Question {
  id: string;
  text: string;
  views: number;
  examId: string;
  isSaved: boolean;
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
  userId?: string;
}

export function QuestionDetail({
  question,
  relatedQuestions,
  userId,
}: QuestionDetailProps) {
  const router = useRouter();

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

  // Mock variations for the dialog
  const questionVariations = [
    {
      id: "var-1",
      text: "Spiega le principali differenze tra arterie e vene",
      professor: "Prof. Rossi",
      date: "2024-01-15",
      timesAsked: 8,
    },
    {
      id: "var-2",
      text: "Confronta il sistema arterioso e venoso",
      professor: "Prof. Bianchi",
      date: "2024-01-10",
      timesAsked: 6,
    },
  ];

  const handleToggleSave = async () => {
    if (!userId) {
      toast.error("Devi effettuare il login per salvare le domande");
      return;
    }

    try {
      const response = await fetch(`/api/questions/${question.id}/save`, {
        method: "POST",
      });

      if (response.ok) {
        setSaved(!saved);
        toast.success(saved ? "Rimosso dai salvati" : "Aggiunto ai salvati");
      }
    } catch {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleCopyAnswer = async () => {
    if (question.aiAnswer) {
      await navigator.clipboard.writeText(question.aiAnswer.content);
      setCopied(true);
      toast.success("Risposta copiata negli appunti!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSavePersonalAnswer = async () => {
    if (!userId) {
      toast.error("Devi effettuare il login");
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
            ? "Risposta salvata e condivisa con la community!"
            : "Risposta salvata con successo!"
        );
      }
    } catch {
      toast.error("Errore durante il salvataggio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLikeAnswer = async (answerId: string) => {
    if (!userId) {
      toast.error("Devi effettuare il login");
      return;
    }

    try {
      const response = await fetch(`/api/answers/${answerId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
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
      toast.error("Errore");
    }
  };

  const handleToggleLikeComment = async (commentId: string) => {
    if (!userId) {
      toast.error("Devi effettuare il login");
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
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
      toast.error("Errore");
    }
  };

  const handlePublishComment = async () => {
    if (!userId) {
      toast.error("Devi effettuare il login");
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
        const comment = await response.json();
        setComments((prev) => [
          {
            ...comment,
            isLiked: false,
            likesCount: 0,
          },
          ...prev,
        ]);
        setNewComment("");
        toast.success("Commento pubblicato!");
      }
    } catch {
      toast.error("Errore durante la pubblicazione");
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
      toast.success(`Grazie per la tua valutazione: ${rating} stelle!`);

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
      toast.success("Feedback inviato!", {
        description: "Grazie per aiutarci a migliorare le risposte dell'IA.",
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
    if (!universityName) return { short: "N/A", color: "#C9B3F9" };

    const universityMap: Record<string, { short: string; color: string }> = {
      "La Sapienza": { short: "Sapienza", color: "#F7B29D" },
      "Università di Bologna": { short: "UniBO", color: "#C9B3F9" },
      "Università di Milano": { short: "UniMI", color: "#A5D6F6" },
    };

    return (
      universityMap[universityName] || {
        short: universityName.slice(0, 8),
        color: "#C9B3F9",
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
            Torna alla Ricerca
          </Button>

          {/* Mobile Question Selector */}
          <div className="md:hidden mb-4">
            <Card className="p-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-sm">
                  {question.exam.subject.emoji} {question.exam.subject.name}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-[#005A9C]/10 text-[#005A9C] border-[#005A9C]/20 font-semibold text-xs px-2 py-0.5"
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
                      {questionFilter === "all" ? "Tutte" : "Solo salvate"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte</SelectItem>
                    <SelectItem value="saved">Solo salvate</SelectItem>
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
                      {questionSort === "views" ? "Più chieste" : "Recenti"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">Più chieste</SelectItem>
                    <SelectItem value="recent">Recenti</SelectItem>
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
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-border rounded-lg shadow-xl z-20 max-h-[300px] overflow-y-auto">
                      {filteredQuestions.map((q, index) => (
                        <button
                          key={q.id}
                          onClick={() => {
                            if (q.id !== question.id) {
                              router.push(`/questions/${q.id}`);
                            }
                            setIsQuestionDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-3 text-sm text-left hover:bg-[#005A9C]/5 transition-colors border-b border-border last:border-b-0 flex items-start gap-2 ${
                            q.id === question.id ? "bg-[#005A9C]/10" : ""
                          }`}
                        >
                          <span className="font-semibold text-[#005A9C] flex-shrink-0 min-w-[24px]">
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
                  Domande - {question.exam.subject.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredQuestions.length} di {filteredQuestions.length} domande
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
                      {questionFilter === "all" ? "Tutte" : "Solo salvate"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte</SelectItem>
                    <SelectItem value="saved">Solo salvate</SelectItem>
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
                      {questionSort === "views" ? "Più chieste" : "Recenti"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">Più chieste</SelectItem>
                    <SelectItem value="recent">Recenti</SelectItem>
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
                      ? "bg-[#EFF6FF] dark:bg-[#005A9C]/10 border-l-4 border-l-[#005A9C]"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p
                      className={`text-sm line-clamp-2 leading-relaxed ${
                        q.id === question.id
                          ? "text-[#005A9C] font-medium"
                          : "text-foreground"
                      }`}
                    >
                      {q.text}
                    </p>
                    {q.id === question.id && saved && (
                      <BookmarkCheck className="w-4 h-4 text-[#005A9C] flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{q.professor}</span>
                    <span>•</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVariationsDialogOpen(true);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#005A9C]/10 text-[#005A9C] hover:bg-[#005A9C]/20 hover:scale-105 transition-all duration-200 border border-[#005A9C]/30 hover:border-[#005A9C]"
                      title="Vedi variazioni della domanda"
                    >
                      <GitBranch className="w-3 h-3" />
                      <span className="font-medium">6x</span>
                    </button>
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
                      ? "bg-[#005A9C] hover:bg-[#004d85] flex-shrink-0"
                      : "flex-shrink-0"
                  }
                >
                  {saved ? (
                    <BookmarkCheck className="w-4 h-4 md:mr-2" />
                  ) : (
                    <Bookmark className="w-4 h-4 md:mr-2" />
                  )}
                  <span className="hidden md:inline">
                    {saved ? "Salvato" : "Salva"}
                  </span>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge
                  variant="outline"
                  className="bg-[#EFF6FF] text-[#005A9C] border-[#005A9C]/20"
                >
                  {question.exam.professor?.name || "N/A"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-[#FFF7ED] text-[#FFA78D] border-[#FFA78D]/20"
                >
                  {question.exam.university.name}
                </Badge>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views} visualizzazioni</span>
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
                    <span>Risposta IA</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="student-answers"
                    className="flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>Studenti</span>
                    <span className="text-xs text-muted-foreground">
                      {studentAnswers.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="my-answer"
                    className="flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <StickyNote className="w-4 h-4" />
                    <span>Mia Risposta</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="col-span-2 md:hidden flex-1 gap-2 text-sm px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Esperienze</span>
                    <span className="text-xs text-muted-foreground">
                      {comments.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* AI Answer Tab */}
                <TabsContent value="ai-answer" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 border-l-4 border-[#005A9C] pl-3">
                      <BookOpen className="w-5 h-5 text-[#005A9C]" />
                      <h2 className="font-medium text-foreground">
                        Risposta IA
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
                      {copied ? "Copiato!" : "Copia"}
                    </Button>
                  </div>

                  {/* AI Rating */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#005A9C]" />
                        <span className="text-sm font-medium">
                          Valuta la Risposta
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
                          Cosa non ti è piaciuto?
                        </label>
                        <Textarea
                          value={aiRatingFeedback}
                          onChange={(e) => setAiRatingFeedback(e.target.value)}
                          placeholder="Descrivi cosa non ha funzionato..."
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
                            Annulla
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSubmitAIFeedback}
                            disabled={!aiRatingFeedback.trim()}
                            className="bg-[#005A9C] hover:bg-[#004d85] text-white"
                          >
                            Invia
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Answer Content */}
                  {question.aiAnswer ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {/* Callout intro */}
                      <div className="bg-[#EFF6FF] dark:bg-[#005A9C]/10 rounded-lg p-4 border-l-4 border-[#005A9C] mb-4">
                        <p className="text-sm leading-relaxed text-foreground m-0">
                          Ecco una risposta dettagliata alla tua domanda,
                          strutturata per facilitare lo studio.
                        </p>
                      </div>

                      <div
                        className="text-sm leading-relaxed text-foreground whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: question.aiAnswer.content,
                        }}
                      />

                      {/* Key points callout */}
                      <div className="bg-[#FFF8F3] dark:bg-[#FFA78D]/5 rounded-lg p-4 border-l-4 border-[#FFA78D] mt-6">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">💡</span>
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2 mt-0">
                              Punti chiave da ricordare
                            </p>
                            <p className="text-sm text-muted-foreground m-0">
                              Studia attentamente i concetti principali e
                              preparati a rispondere alle domande di
                              approfondimento.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Risposta IA non disponibile</p>
                      <p className="text-sm">
                        La risposta sarà generata a breve
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Student Answers Tab */}
                <TabsContent value="student-answers" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 border-l-4 border-[#005A9C] pl-3">
                      <Users className="w-5 h-5 text-[#005A9C]" />
                      <h2 className="font-medium text-foreground">
                        Risposte della Community
                      </h2>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border">
                    💡 <strong>{studentAnswers.length} studenti</strong> hanno
                    condiviso la loro risposta. Leggi, impara e lascia un like
                    alle risposte più utili!
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
                                <AvatarFallback className="bg-[#EFF6FF] text-[#005A9C]">
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
                                    className="text-xs"
                                    style={{
                                      backgroundColor: `${uniInfo.color}20`,
                                      borderColor: uniInfo.color,
                                    }}
                                  >
                                    {uniInfo.short}
                                  </Badge>
                                  {answer.user.year && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-muted"
                                    >
                                      {answer.user.year}º Anno
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
                                    ? "text-[#005A9C]"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <ThumbsUp
                                  className={`w-4 h-4 mr-2 ${
                                    answer.isLiked ? "fill-[#005A9C]/30" : ""
                                  }`}
                                />
                                {answer.likesCount}{" "}
                                {answer.likesCount === 1 ? "like" : "likes"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(answer.content);
                                  toast.success(
                                    "Risposta copiata negli appunti!"
                                  );
                                }}
                                className="h-8"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copia
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
                        Nessuna risposta condivisa ancora
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sii il primo a condividere la tua risposta!
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* My Answer Tab */}
                <TabsContent value="my-answer" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 border-l-4 border-[#FFA78D] pl-3">
                      <StickyNote className="w-5 h-5 text-[#FFA78D]" />
                      <h2 className="font-medium text-foreground">
                        {isEditingPersonalAnswer
                          ? "Scrivi la Tua Risposta"
                          : "La Tua Risposta"}
                      </h2>
                    </div>

                    {!isEditingPersonalAnswer && personalAnswer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingPersonalAnswer(true)}
                        className="border-[#FFA78D] text-[#FFA78D] hover:bg-[#FFA78D]/10"
                      >
                        Modifica
                      </Button>
                    )}
                  </div>

                  <div className="bg-muted/30 rounded-lg border border-border p-4">
                    {isEditingPersonalAnswer ? (
                      <Textarea
                        value={personalAnswer}
                        onChange={(e) => setPersonalAnswer(e.target.value)}
                        placeholder="Scrivi qui la tua risposta... Cerca di essere dettagliato come in un esame orale."
                        className="min-h-[200px] text-sm"
                      />
                    ) : (
                      <div className="min-h-[200px] text-sm leading-relaxed whitespace-pre-wrap">
                        {personalAnswer || (
                          <span className="text-muted-foreground">
                            Nessuna risposta salvata.
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
                              {
                                personalAnswer
                                  .split(/\s+/)
                                  .filter((word) => word.length > 0).length
                              }{" "}
                              parole
                            </span>
                          </div>
                          <div className="h-4 w-px bg-border" />
                          <button
                            onClick={() => setIsAnswerPublic(!isAnswerPublic)}
                            className="flex items-center gap-2 text-sm hover:text-[#005A9C] transition-colors"
                          >
                            {isAnswerPublic ? (
                              <>
                                <Globe className="w-4 h-4 text-[#005A9C]" />
                                <span className="text-[#005A9C] font-medium">
                                  Pubblico
                                </span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Privato
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                        <Button
                          onClick={handleSavePersonalAnswer}
                          className="bg-[#FFA78D] hover:bg-[#ff9473] text-white"
                          size="sm"
                          disabled={isSubmitting}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isSubmitting ? "Salvo..." : "Salva"}
                        </Button>
                      </div>

                      {isAnswerPublic && (
                        <div className="bg-[#EFF6FF] border border-[#005A9C]/20 rounded-lg p-3 flex items-start gap-2">
                          <Users className="w-4 h-4 text-[#005A9C] mt-0.5" />
                          <p className="text-sm text-[#005A9C]">
                            La tua risposta sarà visibile a tutti gli studenti e
                            potrà aiutare la community!
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
                          Salvata •{" "}
                          {
                            personalAnswer
                              .split(/\s+/)
                              .filter((word) => word.length > 0).length
                          }{" "}
                          parole
                        </span>
                      </div>
                      <Button
                        onClick={() => setActiveTab("ai-answer")}
                        className="bg-[#005A9C] hover:bg-[#004d85] text-white"
                        size="sm"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Confronta con IA
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
                    Esperienze d&apos;Esame
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
                    {sortBy === "likes" ? "Più apprezzati" : "Più recenti"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="likes">Più apprezzati</SelectItem>
                  <SelectItem value="recent">Più recenti</SelectItem>
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
              Variazioni della Domanda
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Questa domanda è stata posta {questionVariations.length + 1} volte
              in forme diverse
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* Current Question */}
            <Card className="p-4 border-2 border-[#005A9C] bg-[#005A9C]/5">
              <div className="flex items-start gap-3">
                <Badge className="bg-[#005A9C] text-white shrink-0">
                  Attuale
                </Badge>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {question.text}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{question.exam.professor?.name || "N/A"}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString("it-IT")}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Variations */}
            {questionVariations.map((variation, index) => (
              <Card
                key={variation.id}
                className="p-4 border border-border hover:border-[#005A9C]/50 hover:bg-muted/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className="shrink-0 border-border text-muted-foreground"
                  >
                    #{index + 1}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground">{variation.text}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{variation.professor}</span>
                      <span>•</span>
                      <span>
                        {new Date(variation.date).toLocaleDateString("it-IT")}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        <span>{variation.timesAsked}x chiesta</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={() => setIsVariationsDialogOpen(false)}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              Chiudi
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
}: {
  comments: Comment[];
  newComment: string;
  setNewComment: (v: string) => void;
  onPublish: () => void;
  onToggleLike: (id: string) => void;
  isSubmitting: boolean;
  getInitials: (name: string | null) => string;
  getUniversityInfo: (name: string | undefined) => { short: string; color: string };
  isDesktop?: boolean;
  sortBy?: "likes" | "recent";
  setSortBy?: (v: "likes" | "recent") => void;
}) {
  return (
    <div className={isDesktop ? "flex flex-col h-full" : "space-y-4"}>
      {/* Mobile header with sort */}
      {!isDesktop && sortBy && setSortBy && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 border-l-4 border-[#005A9C] pl-3">
            <MessageCircle className="w-5 h-5 text-[#005A9C]" />
            <h2 className="font-medium text-foreground">
              Esperienze d&apos;Esame
            </h2>
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "likes" | "recent")}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue>
                {sortBy === "likes" ? "Più apprezzati" : "Più recenti"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="likes">Più apprezzati</SelectItem>
              <SelectItem value="recent">Più recenti</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tips */}
      {!isDesktop && (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border">
          💡 Scopri come altri studenti hanno affrontato questa domanda
          all&apos;esame!
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
                      className="text-xs rounded-full px-2"
                      style={{
                        backgroundColor: `${uniInfo.color}20`,
                        borderColor: uniInfo.color,
                        color: uniInfo.color,
                      }}
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
                        comment.isLiked ? "text-[#005A9C]" : ""
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
              Nessuna esperienza condivisa
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
              <MessageCircle className="w-4 h-4 text-[#005A9C]" />
              <span>Condividi la tua esperienza</span>
            </div>
          )}
          <Textarea
            placeholder="Condividi la tua esperienza con questa domanda d'esame...
Come l'ha chiesta il professore?
Consigli per chi la deve affrontare?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] text-sm resize-none border-2"
          />
          <div className="flex justify-end">
            <Button
              onClick={onPublish}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-[#FFA78D] hover:bg-[#ff9473] text-white rounded-full px-6"
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Invio..." : "Pubblica"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
