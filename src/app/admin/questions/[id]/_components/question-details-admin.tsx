"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bot, Eye, MessageSquare, Bookmark, Users, Calendar, User, Star, ThumbsUp, Edit, Trash2, EyeOff, Download, MoreVertical, Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { AiAnswerEditor } from "./ai-answer-editor";
import { EditQuestionDialog } from "./edit-question-dialog";

interface QuestionDetailsAdminProps {
  question: {
    id: string;
    text: string;
    views: number;
    timesAsked: number;
    createdAt: Date;
    exam: {
      id: string;
      subject: { id: string; name: string; emoji: string | null };
      professor: { id: string; name: string } | null;
      university: { id: string; name: string };
      course: { id: string; name: string } | null;
      creator: { id: string; name: string; email: string } | null;
    };
    aiAnswer: {
      id: string;
      content: string;
      source: string | null;
      model: string | null;
      ratings: {
        id: string;
        rating: number;
        feedback: string | null;
        createdAt: Date;
        user: {
          id: string;
          name: string;
          email: string;
        };
      }[];
    } | null;
    studentAnswers: {
      id: string;
      content: string;
      isPublic: boolean;
      createdAt: Date;
      user: {
        id: string;
        name: string;
        email: string;
        university: { name: string; shortName: string | null };
        year: number;
      };
      _count: {
        likes: number;
      };
    }[];
    comments: {
      id: string;
      content: string;
      createdAt: Date;
      user: {
        id: string;
        name: string;
        email: string;
      };
      _count: {
        likes: number;
      };
    }[];
    variations: {
      id: string;
      text: string;
      views: number;
      createdAt: Date;
      exam: {
        subject: { name: string; emoji: string | null };
        professor: { name: string } | null;
      };
    }[];
    _count: {
      variations: number;
      comments: number;
      savedBy: number;
    };
  };
}

export function QuestionDetailsAdmin({ question }: QuestionDetailsAdminProps) {
  const t = useTranslations("admin.questionDetail");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dateLocale = locale === "it" ? it : enUS;

  const [activeTab, setActiveTab] = useState("info");
  const [isHidden, setIsHidden] = useState(false);
  const [answerVisibilityFilter, setAnswerVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!confirm(t("actions.confirmDelete"))) return;

    try {
      // TODO: Implement delete API call
      console.log("Delete question:", question.id);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleToggleHidden = async () => {
    const action = isHidden ? "show" : "hide";
    if (!confirm(t(`actions.confirm${action.charAt(0).toUpperCase() + action.slice(1)}`))) return;

    try {
      // TODO: Implement hide/show API call
      setIsHidden(!isHidden);
      console.log(`${action} question:`, question.id);
    } catch (error) {
      console.error(`Error ${action} question:`, error);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export question:", question.id);
  };

  // Calculate average rating
  const avgRating = question.aiAnswer?.ratings.length
    ? question.aiAnswer.ratings.reduce((sum, r) => sum + r.rating, 0) / question.aiAnswer.ratings.length
    : 0;

  // Filter student answers based on visibility
  const filteredStudentAnswers = question.studentAnswers.filter((answer) => {
    if (answerVisibilityFilter === "all") return true;
    if (answerVisibilityFilter === "public") return answer.isPublic;
    if (answerVisibilityFilter === "private") return !answer.isPublic;
    return true;
  });

  return (
    <>
      <EditQuestionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        question={{ id: question.id, text: question.text }}
      />

      <div className="p-6 space-y-6">
        {/* Question Info Card */}
        <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl">{question.text}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                {t("actions.edit")}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {t("actions.more") || "Azioni"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleHidden}>
                    <EyeOff className="h-4 w-4 mr-2" />
                    {isHidden ? t("actions.show") : t("actions.hide")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("actions.export")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("actions.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline">
                {question.exam.subject.emoji} {question.exam.subject.name}
              </Badge>
              {question.exam.professor && (
                <Badge variant="outline">{question.exam.professor.name}</Badge>
              )}
              <Badge variant="secondary">{question.exam.university.name}</Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{question.views}</p>
                <p className="text-xs text-muted-foreground">{t("views")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{question.studentAnswers.length}</p>
                <p className="text-xs text-muted-foreground">{t("answers")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{question._count.comments}</p>
                <p className="text-xs text-muted-foreground">{t("comments")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{question._count.savedBy}</p>
                <p className="text-xs text-muted-foreground">{t("saved")}</p>
              </div>
            </div>
          </div>

          {question.exam.creator && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{t("createdBy")}: {question.exam.creator.name} ({question.exam.creator.email})</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(question.createdAt), "PPpp", { locale: dateLocale })}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="inline-flex w-auto h-auto p-0 bg-transparent border-b rounded-none">
          <TabsTrigger value="info" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <Bot className="h-4 w-4" />
            {t("tabs.aiAnswer")}
            {question.aiAnswer && <Badge variant="secondary" className="ml-1">✓</Badge>}
          </TabsTrigger>
          <TabsTrigger value="studentAnswers" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <Users className="h-4 w-4" />
            {t("tabs.studentAnswers")}
            <Badge variant="secondary" className="ml-1">{question.studentAnswers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <MessageSquare className="h-4 w-4" />
            {t("tabs.comments")}
            <Badge variant="secondary" className="ml-1">{question.comments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="variations" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <Eye className="h-4 w-4" />
            {t("tabs.variations")}
            <Badge variant="secondary" className="ml-1">{question.variations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ratings" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <Star className="h-4 w-4" />
            {t("tabs.ratings")}
            <Badge variant="secondary" className="ml-1">
              {question.aiAnswer?.ratings.length || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* AI Answer Tab */}
        <TabsContent value="info" className="space-y-4">
          <AiAnswerEditor
            questionId={question.id}
            initialData={question.aiAnswer}
          />
        </TabsContent>

        {/* Student Answers Tab */}
        <TabsContent value="studentAnswers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{t("studentAnswers.title")}</CardTitle>
                  <CardDescription>
                    {t("studentAnswers.description", { count: filteredStudentAnswers.length })}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">{t("studentAnswers.visibility")}</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="visibility-all"
                        checked={answerVisibilityFilter === "all"}
                        onCheckedChange={() => setAnswerVisibilityFilter("all")}
                      />
                      <label htmlFor="visibility-all" className="text-xs cursor-pointer">
                        {t("filters.all")}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="visibility-public"
                        checked={answerVisibilityFilter === "public"}
                        onCheckedChange={() => setAnswerVisibilityFilter("public")}
                      />
                      <label htmlFor="visibility-public" className="text-xs cursor-pointer">
                        {t("studentAnswers.public")}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="visibility-private"
                        checked={answerVisibilityFilter === "private"}
                        onCheckedChange={() => setAnswerVisibilityFilter("private")}
                      />
                      <label htmlFor="visibility-private" className="text-xs cursor-pointer">
                        {t("studentAnswers.private")}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredStudentAnswers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("studentAnswers.empty")}
                </p>
              ) : (
                filteredStudentAnswers.map((answer) => (
                  <Card key={answer.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {answer.user.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{answer.user.name}</p>
                              <Badge variant={answer.isPublic ? "default" : "secondary"}>
                                {answer.isPublic ? t("studentAnswers.public") : t("studentAnswers.private")}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {answer.user.university.shortName || answer.user.university.name} • {answer.user.year}º anno
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(answer.createdAt), "PPpp", { locale: dateLocale })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            {answer._count.likes}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => console.log("Toggle visibility:", answer.id)}>
                                {answer.isPublic ? (
                                  <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    {t("studentAnswers.makePrivate")}
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    {t("studentAnswers.makePublic")}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log("Edit answer:", answer.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("studentAnswers.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => console.log("Delete answer:", answer.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("studentAnswers.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: answer.content }} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabs.comments")}</CardTitle>
              <CardDescription>
                {t("commentsTab.description", { count: question.comments.length })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("commentsTab.empty")}
                </p>
              ) : (
                question.comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {comment.user.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{comment.user.name}</p>
                            <p className="text-xs text-muted-foreground">{comment.user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), "PPpp", { locale: dateLocale })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            {comment._count.likes}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => console.log("Edit comment:", comment.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("commentsTab.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => console.log("Delete comment:", comment.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("commentsTab.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variations Tab */}
        <TabsContent value="variations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabs.variations")}</CardTitle>
              <CardDescription>
                {t("variationsTab.description", { count: question.variations.length })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.variations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("variationsTab.empty")}
                </p>
              ) : (
                question.variations.map((variation) => (
                  <Card key={variation.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{variation.text}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {variation.exam.subject.emoji} {variation.exam.subject.name}
                            </Badge>
                            {variation.exam.professor && (
                              <Badge variant="outline">{variation.exam.professor.name}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {variation.views}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(variation.createdAt), "PP", { locale: dateLocale })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ratings Tab */}
        <TabsContent value="ratings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("ratingsTab.title")}</CardTitle>
              <CardDescription>
                {question.aiAnswer ? (
                  <>
                    {t("ratingsTab.average")}: {avgRating.toFixed(1)} / 5.0 ({question.aiAnswer.ratings.length} {t("ratingsTab.count")})
                  </>
                ) : (
                  t("ratingsTab.noAiAnswer")
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!question.aiAnswer || question.aiAnswer.ratings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("ratingsTab.empty")}
                </p>
              ) : (
                question.aiAnswer.ratings.map((rating) => (
                  <Card key={rating.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {rating.user.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{rating.user.name}</p>
                            <p className="text-xs text-muted-foreground">{rating.user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(rating.createdAt), "PPpp", { locale: dateLocale })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rating.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    {rating.feedback && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{rating.feedback}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
