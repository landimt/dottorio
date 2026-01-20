"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, Link2, MessageSquare, Search, Trash2, Edit, Bot, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  views: number;
  timesAsked: number;
  isCanonical: boolean;
  groupId: string | null;
  createdAt: Date;
  exam: {
    subject: { name: string; emoji: string | null };
    professor: { name: string } | null;
    university: { shortName: string | null; name: string };
  };
  canonical: { id: string; text: string } | null;
  aiAnswer: { id: string } | null;
  _count: {
    variations: number;
    studentAnswers: number;
    comments: number;
  };
}

interface QuestionsTableProps {
  questions: Question[];
}

export function QuestionsTable({ questions: initialQuestions }: QuestionsTableProps) {
  const t = useTranslations("admin.questionsPage");
  const tCommon = useTranslations("admin.common");
  const router = useRouter();

  const [questions, setQuestions] = useState(initialQuestions);
  const [search, setSearch] = useState("");

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(search.toLowerCase()) ||
    q.exam.subject.name.toLowerCase().includes(search.toLowerCase()) ||
    q.exam.professor?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Errore nell'eliminazione");

      setQuestions(questions.filter(q => q.id !== id));
      toast.success(t("questionDeleted"));
    } catch {
      toast.error(t("deleteError"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("count", { count: questions.length })}</CardDescription>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">{t("question")}</TableHead>
              <TableHead>{t("subject")}</TableHead>
              <TableHead>{t("professor")}</TableHead>
              <TableHead className="text-center">{t("stats")}</TableHead>
              <TableHead className="text-center">{t("aiAnswer")}</TableHead>
              <TableHead>{t("links")}</TableHead>
              <TableHead className="w-[120px]">{tCommon("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="line-clamp-2 text-sm">{question.text}</p>
                    <div className="flex items-center gap-2">
                      {question.isCanonical ? (
                        <Badge variant="default" className="text-xs">
                          {t("canonical")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {t("variation")}
                        </Badge>
                      )}
                      {question._count.variations > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {t("variations", { count: question._count.variations })}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{question.exam.subject.emoji}</span>
                    <span className="text-sm">{question.exam.subject.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {question.exam.professor?.name || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1" title={t("views")}>
                      <Eye className="h-3 w-3" />
                      {question.views}
                    </span>
                    <span className="flex items-center gap-1" title={t("answers")}>
                      <MessageSquare className="h-3 w-3" />
                      {question._count.studentAnswers}
                    </span>
                    <span title={t("timesAsked")}>
                      x{question.timesAsked}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {question.aiAnswer ? (
                      <div className="flex items-center gap-1 text-green-600" title={t("hasAiAnswer")}>
                        <Bot className="h-4 w-4" />
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground" title={t("noAiAnswer")}>
                        <Bot className="h-4 w-4" />
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {question.groupId ? (
                    <div className="flex items-center gap-1">
                      <Link2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {t("group")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/questions/${question.id}`)}
                      title={t("edit")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(question.id)}
                      title={t("delete")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
