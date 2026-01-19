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

  // Student answers with local state for likes
  const [studentAnswers, setStudentAnswers] = useState(question.studentAnswers);
  const [comments, setComments] = useState(question.comments);

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

    try {
      await fetch(`/api/ai-answers/${question.aiAnswer.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      toast.success(`Grazie per la tua valutazione: ${rating} stelle!`);
    } catch {
      // Ignore rating errors
    }
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
        </div>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 min-h-[calc(100vh-180px)]">
          {/* Left Column - Related Questions (Hidden on mobile) */}
          <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border overflow-hidden flex-col">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">
                Domande - {question.exam.subject.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {relatedQuestions.length + 1} domande
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Current question */}
              <div className="w-full text-left p-4 border-b border-border bg-[#EFF6FF] dark:bg-[#005A9C]/10 border-l-4 border-l-[#005A9C]">
                <p className="text-sm text-[#005A9C] font-medium line-clamp-2">
                  {question.text}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <span>{question.exam.professor?.name || "N/A"}</span>
                  <span>•</span>
                  <span>{question.views} views</span>
                </div>
              </div>

              {/* Related questions */}
              {relatedQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => router.push(`/questions/${q.id}`)}
                  className="w-full text-left p-4 border-b border-border transition-all hover:bg-muted/50"
                >
                  <p className="text-sm text-foreground line-clamp-2">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <span>{q.exam.professor?.name || "N/A"}</span>
                    <span>•</span>
                    <span>{q.views} views</span>
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
                <TabsList className="w-full mb-4 grid grid-cols-2 md:grid-cols-3 gap-1">
                  <TabsTrigger
                    value="ai-answer"
                    className="flex-1 gap-1.5 text-xs md:text-sm px-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Risposta IA</span>
                    <span className="sm:hidden">IA</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="student-answers"
                    className="flex-1 gap-1 text-xs md:text-sm px-2"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Studenti</span>
                    <span className="sm:hidden">Stud.</span>
                    <Badge variant="outline" className="h-5 px-1.5 text-xs">
                      {studentAnswers.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="my-answer"
                    className="flex-1 gap-1.5 text-xs md:text-sm px-2"
                  >
                    <StickyNote className="w-4 h-4" />
                    <span className="hidden sm:inline">Mia Risposta</span>
                    <span className="sm:hidden">Mia</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="col-span-2 md:hidden flex-1 gap-1.5 text-xs px-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Esperienze</span>
                    <Badge variant="outline" className="h-5 px-1.5 text-xs">
                      {comments.length}
                    </Badge>
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
                    <Button variant="outline" size="sm" onClick={handleCopyAnswer}>
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
                  </div>

                  {/* AI Answer Content */}
                  {question.aiAnswer ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="bg-[#EFF6FF] dark:bg-[#005A9C]/10 rounded-lg p-4 border-l-4 border-[#005A9C]">
                        <div
                          className="text-sm leading-relaxed text-foreground whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: question.aiAnswer.content,
                          }}
                        />
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
                    <strong>{studentAnswers.length} studenti</strong> hanno
                    condiviso la loro risposta.
                  </div>

                  {studentAnswers.length > 0 ? (
                    <div className="space-y-4">
                      {studentAnswers.map((answer) => (
                        <Card key={answer.id} className="p-4">
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
                                {answer.user.university && (
                                  <Badge variant="outline" className="text-xs">
                                    {answer.user.university.name}
                                  </Badge>
                                )}
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
                              onClick={() => handleToggleLikeAnswer(answer.id)}
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
                          </div>
                        </Card>
                      ))}
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
                    </div>
                  )}
                </TabsContent>

                {/* Comments Tab (Mobile Only) */}
                <TabsContent
                  value="comments"
                  className="space-y-4 mt-0 md:hidden"
                >
                  <CommentsSection
                    comments={comments}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onPublish={handlePublishComment}
                    onToggleLike={handleToggleLikeComment}
                    isSubmitting={isSubmitting}
                    getInitials={getInitials}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column - Comments (Hidden on mobile) */}
          <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border overflow-hidden flex-col">
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#005A9C]" />
                  <h3 className="font-semibold text-foreground">
                    Esperienze d&apos;Esame
                  </h3>
                </div>
                <Badge variant="outline">{comments.length}</Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <CommentsSection
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                onPublish={handlePublishComment}
                onToggleLike={handleToggleLikeComment}
                isSubmitting={isSubmitting}
                getInitials={getInitials}
                isDesktop
              />
            </div>
          </div>
        </div>
      </div>
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
  isDesktop = false,
}: {
  comments: Comment[];
  newComment: string;
  setNewComment: (v: string) => void;
  onPublish: () => void;
  onToggleLike: (id: string) => void;
  isSubmitting: boolean;
  getInitials: (name: string | null) => string;
  isDesktop?: boolean;
}) {
  return (
    <div className={isDesktop ? "flex flex-col h-full" : "space-y-4"}>
      {/* Comments List */}
      <div className={isDesktop ? "flex-1 overflow-y-auto p-4 space-y-4" : "space-y-4"}>
        {comments.map((comment) => (
          <Card key={comment.id} className={isDesktop ? "p-3" : "p-4"}>
            <div className="flex items-start gap-3">
              <Avatar className={isDesktop ? "w-8 h-8" : "w-10 h-10"}>
                <AvatarFallback className="bg-[#EFF6FF] text-[#005A9C] text-sm">
                  {getInitials(comment.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium text-foreground text-sm">
                    {comment.user.name}
                  </span>
                  {comment.user.university && (
                    <Badge variant="outline" className="text-xs">
                      {comment.user.university.name}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-2">
                  {comment.content}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleLike(comment.id)}
                    className={`h-6 px-2 ${
                      comment.isLiked ? "text-[#005A9C]" : ""
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3 h-3 mr-1 ${
                        comment.isLiked ? "fill-current" : ""
                      }`}
                    />
                    {comment.likesCount}
                  </Button>
                  <span>
                    {new Date(comment.createdAt).toLocaleDateString("it-IT")}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Nessuna esperienza condivisa
            </p>
          </div>
        )}
      </div>

      {/* Add Comment */}
      <div className={isDesktop ? "p-4 border-t border-border bg-muted/30" : ""}>
        <Card className={isDesktop ? "p-0 border-0 bg-transparent shadow-none" : "p-4 bg-muted/30"}>
          <CardContent className={isDesktop ? "p-0" : "p-0"}>
            <div className="space-y-2">
              <Textarea
                placeholder="Condividi la tua esperienza con questa domanda..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex justify-end">
                <Button
                  onClick={onPublish}
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-[#005A9C] hover:bg-[#004d85] text-white"
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Invio..." : "Pubblica"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
